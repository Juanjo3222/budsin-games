(function () {
  "use strict";

  // ─────────────────────────────────────────────
  //  Storage keys  (shared with settings.html)
  // ─────────────────────────────────────────────
  var KEYS = {
    LANGUAGE:        "budsin_language",
    CLASSROOM_URL:   "budsin_classroom_url",   // legacy single-URL key (kept for back-compat)
    URL_LIST:        "budsin_url_list",         // JSON array of { id, name, url, active }
    HOTKEY:          "budsin_hotkey",           // stored key code string, e.g. "Backquote"
    QUICK_TOGGLE:    "budsin_quick_toggle_visible", // "1" | "0"
    AUTO_DISGUISE:   "budsin_auto_disguise_ms", // number as string, 0 = disabled
  };

  var DEFAULT_URL  = "https://docs.google.com/document/d/1gwlAb1OGRGyBkAvdOzILU-i9UquM4nauJ6X3uSnyUXE/edit?usp=sharing";
  var DEFAULT_AUTO_MS = 0;

  // DOM IDs
  var IDS = {
    OVERLAY:      "juanjo-classroom-overlay",
    FRAME:        "juanjo-classroom-frame",
    CLOSE:        "juanjo-classroom-close",
    QUICK:        "juanjo-classroom-quick-toggle",
    FOCUS_TRAP:   "juanjo-classroom-focus-trap",
    THEME_BTN:    "budsin-theme-toggle",
    FULLSCREEN_BTN: "budsin-fullscreen-toggle",
  };

  var LOADED_ATTR  = "data-loaded";

  // Runtime state
  var originalTitle        = document.title;
  var originalFaviconHref  = getFaviconHref();
  var disguisedTitle       = "Google Docs";
  var disguisedFaviconHref = "https://www.google.com/favicon.ico";
  var fullscreenHotkeyInterval = null;
  var forceHotkeyFocusFromIframe = false;
  var autoDisguiseTimer    = null;

  // ─────────────────────────────────────────────
  //  Config helpers
  // ─────────────────────────────────────────────
  function store(key, value) {
    try { window.localStorage.setItem(key, value); } catch (_) {}
  }

  function load(key, fallback) {
    try { return window.localStorage.getItem(key) || fallback; } catch (_) { return fallback; }
  }

  /** Returns the active URL from the list, falling back to legacy single key, then default. */
  function getActiveUrl() {
    try {
      var raw = window.localStorage.getItem(KEYS.URL_LIST);
      if (raw) {
        var list = JSON.parse(raw);
        if (Array.isArray(list) && list.length) {
          var active = list.find(function (e) { return e.active; }) || list[0];
          return active.url || DEFAULT_URL;
        }
      }
    } catch (_) {}
    // Fallback: legacy single key
    var legacy = load(KEYS.CLASSROOM_URL, "");
    return legacy || DEFAULT_URL;
  }

  /** Returns the configured hotkey code(s). Always returns an object with `codes` and `keys` arrays. */
  function getHotkeyConfig() {
    var stored = load(KEYS.HOTKEY, "");
    if (stored) {
      // stored is a JSON array of code strings, or a plain code string
      try {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return { codes: parsed, keys: [] };
      } catch (_) {}
      return { codes: [stored], keys: [] };
    }
    // Default: backtick family
    return {
      codes: ["Backquote", "IntlBackslash"],
      keys:  ["|", "\u00b0", "\u00ba"],
    };
  }

  function isQuickToggleVisible() {
    return load(KEYS.QUICK_TOGGLE, "1") !== "0";
  }

  function getAutoDisguiseMs() {
    var v = parseInt(load(KEYS.AUTO_DISGUISE, String(DEFAULT_AUTO_MS)), 10);
    return isNaN(v) ? 0 : v;
  }

  // ─────────────────────────────────────────────
  //  Language
  // ─────────────────────────────────────────────
  function getCurrentLanguage() {
    try {
      var url   = new URL(window.location.href);
      var param = url.searchParams.get("lang");
      if (param) {
        var r = param === "en" ? "en" : "es";
        window.localStorage.setItem(KEYS.LANGUAGE, r);
        return r;
      }
      return window.localStorage.getItem(KEYS.LANGUAGE) === "en" ? "en" : "es";
    } catch (_) { return "es"; }
  }

  function getLocaleText() {
    if (getCurrentLanguage() === "en") {
      return { closeLabel: "Close cover mode", quickToggle: "Hide", quickToggleAria: "Toggle hidden mode" };
    }
    return { closeLabel: "Cerrar modo oculto", quickToggle: "Ocultar", quickToggleAria: "Activar modo ocultar" };
  }

  // ─────────────────────────────────────────────
  //  Favicon helpers
  // ─────────────────────────────────────────────
  function getFaviconElement() {
    return document.querySelector("link[rel~='icon']") || null;
  }

  function getFaviconHref() {
    var el = getFaviconElement();
    return el ? (el.href || el.getAttribute("href") || "") : "";
  }

  function setFaviconHref(href) {
    if (!href) return;
    var el = getFaviconElement();
    if (el) { el.href = href; return; }
    var link = document.createElement("link");
    link.rel  = "icon";
    link.href = href;
    document.head.appendChild(link);
  }

  // ─────────────────────────────────────────────
  //  Disguise metadata (title + favicon from URL)
  // ─────────────────────────────────────────────
  function resolveDisguisedPageData() {
    var url = getActiveUrl();
    try {
      var parsed = new URL(url);
      disguisedTitle       = parsed.hostname.replace(/^www\./, "");
      disguisedFaviconHref = "https://www.google.com/s2/favicons?sz=64&domain_url=" + encodeURIComponent(parsed.origin);
    } catch (_) {
      disguisedTitle       = "Google Docs";
      disguisedFaviconHref = "https://www.google.com/favicon.ico";
    }

    window.fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("blocked");
        return res.text();
      })
      .then(function (html) {
        var doc        = new DOMParser().parseFromString(html, "text/html");
        var remoteTitle = (doc.title || "").trim();
        var iconEl     = doc.querySelector("link[rel~='icon']");
        var remoteIcon = iconEl ? (iconEl.getAttribute("href") || "").trim() : "";
        if (remoteTitle) disguisedTitle = remoteTitle;
        if (remoteIcon) {
          try { disguisedFaviconHref = new URL(remoteIcon, url).href; } catch (_) {}
        }
      })
      .catch(function () {});
  }

  // ─────────────────────────────────────────────
  //  Overlay / UI creation
  // ─────────────────────────────────────────────
  function createOverlay() {
    if (document.getElementById(IDS.OVERLAY)) return document.getElementById(IDS.OVERLAY);

    var style = document.createElement("style");
    style.textContent = [
      "#" + IDS.OVERLAY + "{position:fixed;inset:0;z-index:999999;display:none;background:#0b1220;}",
      "#" + IDS.OVERLAY + ".is-open{display:block;}",
      "#" + IDS.OVERLAY + " iframe{width:100%;height:100%;border:0;display:block;background:#fff;}",
      // Solid-color flash layer (immediate feedback before iframe paints)
      "#" + IDS.OVERLAY + "::before{content:'';position:absolute;inset:0;background:#fff;z-index:1;pointer-events:none;}",
      "#" + IDS.OVERLAY + " iframe{position:relative;z-index:2;}",
      "#" + IDS.CLOSE + "{position:fixed;top:14px;right:14px;z-index:1000000;width:44px;height:44px;border:0;border-radius:999px;background:rgba(15,23,42,.82);color:#fff;font:700 28px/1 Arial,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);}",
      "#" + IDS.CLOSE + ":hover{background:rgba(30,41,59,.92);}",
      "#" + IDS.QUICK + "{position:fixed;left:14px;bottom:14px;z-index:1000001;min-height:40px;padding:0 14px;border:0;border-radius:999px;background:rgba(15,23,42,.82);color:#fff;font:700 12px/1 Arial,sans-serif;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);}",
      "#" + IDS.QUICK + ":hover{background:rgba(30,41,59,.92);}",
      "body.juanjo-classroom-open{overflow:hidden;}",
    ].join("\n");
    document.head.appendChild(style);

    var overlay = document.createElement("div");
    overlay.id = IDS.OVERLAY;
    overlay.setAttribute("aria-hidden", "true");

    var close = document.createElement("button");
    close.id   = IDS.CLOSE;
    close.type = "button";
    close.setAttribute("aria-label", getLocaleText().closeLabel);
    close.textContent = "\u00d7";  // ×
    close.addEventListener("click", toggleClassroom);

    var frame = document.createElement("iframe");
    frame.id  = IDS.FRAME;
    frame.setAttribute("allow", "fullscreen");
    frame.setAttribute("allowfullscreen", "");
    frame.setAttribute("sandbox", "allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts");

    overlay.appendChild(close);
    overlay.appendChild(frame);
    document.body.appendChild(overlay);
    return overlay;
  }

  // ─────────────────────────────────────────────
  //  Friday Night Funkin' escape helpers
  // ─────────────────────────────────────────────
  function createFunkinTimestamp() {
    var fromFloat = window.haxe_Int64Helper && window.haxe_Int64Helper.fromFloat;
    var now = (window.performance && typeof window.performance.now === "function")
      ? window.performance.now() : Date.now();
    return fromFloat ? fromFloat(now) : { high: 0, low: now | 0 };
  }

  function triggerFunkinEscape() {
    var flixel  = window.flixel_FlxG;
    var game    = flixel && flixel.game;
    var openfl  = window.openfl_Lib;
    var current = openfl && openfl.get_current && openfl.get_current();
    var stage   = current && current.stage;
    var win     = stage && stage.application && stage.application.__window
      ? stage.application.__window : stage && stage.window;
    if (!game || !win) return;
    var key = 27, mod = 0;
    if (win.onKeyDown)         win.onKeyDown.dispatch(key, mod);
    if (win.onKeyDownPrecise)  win.onKeyDownPrecise.dispatch(key, mod, createFunkinTimestamp());
    if (win.onKeyUp)           win.onKeyUp.dispatch(key, mod);
    if (win.onKeyUpPrecise)    win.onKeyUpPrecise.dispatch(key, mod, createFunkinTimestamp());
  }

  // ─────────────────────────────────────────────
  //  Fullscreen helpers
  // ─────────────────────────────────────────────
  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function exitFullscreen() {
    if (document.exitFullscreen)        return document.exitFullscreen();
    if (document.webkitExitFullscreen)  { document.webkitExitFullscreen(); return null; }
    return null;
  }

  function waitForFullscreenExit(callback) {
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      callback();
    }
    function onChange() { if (!getFullscreenElement()) finish(); }
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    window.setTimeout(finish, 400);
  }

  // ─────────────────────────────────────────────
  //  Frame URL management
  // ─────────────────────────────────────────────
  function ensureFrameUrl(frame) {
    if (!frame) return;
    var url = getActiveUrl();
    if (!frame.getAttribute(LOADED_ATTR) || frame.src !== url) {
      frame.src = url;
      frame.setAttribute(LOADED_ATTR, "true");
    }
  }

  function preloadFrame() {
    var frame = document.getElementById(IDS.FRAME);
    if (frame) ensureFrameUrl(frame);
  }

  // ─────────────────────────────────────────────
  //  Overlay state
  // ─────────────────────────────────────────────
  function syncControlDisable(willOpen) {
    [IDS.THEME_BTN, IDS.FULLSCREEN_BTN].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (willOpen) {
        el.dataset.juanjoWasDisabled = el.disabled ? "1" : "0";
        el.disabled = true;
        el.setAttribute("aria-disabled", "true");
      } else {
        el.disabled = el.dataset.juanjoWasDisabled === "1";
        el.removeAttribute("aria-disabled");
        delete el.dataset.juanjoWasDisabled;
      }
    });
  }

  function applyOverlayState(overlay, willOpen) {
    overlay.classList.toggle("is-open", willOpen);
    document.body.classList.toggle("juanjo-classroom-open", willOpen);
    syncControlDisable(willOpen);
    overlay.setAttribute("aria-hidden", willOpen ? "false" : "true");
    document.title = willOpen ? disguisedTitle : originalTitle;
    setFaviconHref(willOpen ? disguisedFaviconHref : originalFaviconHref);
  }

  // ─────────────────────────────────────────────
  //  Toggle
  // ─────────────────────────────────────────────
  function toggleClassroom() {
    var overlay  = createOverlay();
    var frame    = document.getElementById(IDS.FRAME);
    var isOpen   = overlay.classList.contains("is-open");
    var willOpen = !isOpen;
    var fsEl     = getFullscreenElement();

    if (!isOpen && frame) ensureFrameUrl(frame);
    triggerFunkinEscape();
    resetAutoDisguiseTimer();

    if (willOpen && fsEl) {
      waitForFullscreenExit(function () { applyOverlayState(overlay, true); });
      exitFullscreen();
      return;
    }

    applyOverlayState(overlay, willOpen);
  }

  // ─────────────────────────────────────────────
  //  Auto-disguise on inactivity
  // ─────────────────────────────────────────────
  function clearAutoDisguiseTimer() {
    if (autoDisguiseTimer) { window.clearTimeout(autoDisguiseTimer); autoDisguiseTimer = null; }
  }

  function resetAutoDisguiseTimer() {
    clearAutoDisguiseTimer();
    var ms = getAutoDisguiseMs();
    if (!ms) return;
    autoDisguiseTimer = window.setTimeout(function () {
      var overlay = document.getElementById(IDS.OVERLAY);
      if (!overlay || overlay.classList.contains("is-open")) return; // already disguised
      toggleClassroom();
    }, ms);
  }

  function onUserActivity() {
    // If overlay is open user interaction should NOT close it — that's the hotkey/button's job
    resetAutoDisguiseTimer();
  }

  function startActivityListeners() {
    ["mousemove", "keydown", "pointerdown", "scroll", "touchstart"].forEach(function (ev) {
      window.addEventListener(ev, onUserActivity, { passive: true, capture: true });
    });
    resetAutoDisguiseTimer();
  }

  // ─────────────────────────────────────────────
  //  Quick-toggle button
  // ─────────────────────────────────────────────
  function ensureQuickToggleButton() {
    if (document.getElementById(IDS.QUICK)) return;
    if (!isQuickToggleVisible()) return;

    var btn = document.createElement("button");
    btn.id   = IDS.QUICK;
    btn.type = "button";
    btn.textContent = getLocaleText().quickToggle;
    btn.setAttribute("aria-label", getLocaleText().quickToggleAria);
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleClassroom();
    });
    document.body.appendChild(btn);
  }

  // ─────────────────────────────────────────────
  //  Focus trap (keeps hotkey responsive when iframe is focused)
  // ─────────────────────────────────────────────
  function ensureFocusTrap() {
    var el = document.getElementById(IDS.FOCUS_TRAP);
    if (el) return el;
    el = document.createElement("button");
    el.id   = IDS.FOCUS_TRAP;
    el.type = "button";
    el.setAttribute("aria-hidden", "true");
    el.tabIndex = -1;
    Object.assign(el.style, { position:"fixed", left:"-9999px", top:"-9999px", width:"1px", height:"1px", opacity:"0", pointerEvents:"none" });
    document.body.appendChild(el);
    return el;
  }

  function recoverPageHotkeyFocus() {
    var el = ensureFocusTrap();
    if (!el || typeof el.focus !== "function") return;
    try { el.focus({ preventScroll: true }); } catch (_) { el.focus(); }
  }

  function clearHotkeyFocusLoop() {
    if (!fullscreenHotkeyInterval) return;
    window.clearInterval(fullscreenHotkeyInterval);
    fullscreenHotkeyInterval = null;
  }

  function isGameIframe(el) {
    return el && el.tagName && el.tagName.toLowerCase() === "iframe" && el.id !== IDS.FRAME;
  }

  function shouldForceHotkeyFocus() {
    if (isGameIframe(getFullscreenElement())) return true;
    if (forceHotkeyFocusFromIframe)           return true;
    return isGameIframe(document.activeElement);
  }

  function syncHotkeyFocusLoop() {
    if (!shouldForceHotkeyFocus()) { clearHotkeyFocusLoop(); return; }
    recoverPageHotkeyFocus();
    if (!fullscreenHotkeyInterval) {
      fullscreenHotkeyInterval = window.setInterval(function () {
        if (!shouldForceHotkeyFocus()) { clearHotkeyFocusLoop(); return; }
        recoverPageHotkeyFocus();
      }, 350);
    }
  }

  // ─────────────────────────────────────────────
  //  Hotkey detection
  // ─────────────────────────────────────────────
  function isToggleHotkey(event) {
    var cfg   = getHotkeyConfig();
    var code  = event.code || "";
    var key   = event.key  || "";
    if (cfg.codes.indexOf(code) !== -1) return true;
    if (cfg.keys.length && cfg.keys.indexOf(key) !== -1) return true;
    // Default fallbacks when nothing is configured
    if (!cfg.codes.length && !cfg.keys.length) {
      return code === "Backquote" || code === "IntlBackslash" || key === "|" || key === "\u00b0" || key === "\u00ba";
    }
    return false;
  }

  function shouldIgnoreTarget(target) {
    if (!target) return false;
    var tag = (target.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;
  }

  function handleHotkeyKeydown(event) {
    if (event.defaultPrevented) return;
    if (isToggleHotkey(event)) {
      event.preventDefault();
      event.stopPropagation();
      toggleClassroom();
      return;
    }
    if (shouldIgnoreTarget(event.target)) return;
  }

  // ─────────────────────────────────────────────
  //  Iframe hotkey binding
  // ─────────────────────────────────────────────
  function attachHotkeyToIframe(iframe) {
    if (!iframe || iframe.__juanjoHotkeyBound) return;

    function onFrameKeydown(event) {
      if (event.defaultPrevented) return;
      if (isToggleHotkey(event)) {
        event.preventDefault();
        event.stopPropagation();
        toggleClassroom();
      }
    }

    function bindNow() {
      try {
        if (!iframe.contentWindow || !iframe.contentDocument) return;
        iframe.contentWindow.addEventListener("keydown", onFrameKeydown, true);
        iframe.contentDocument.addEventListener("keydown", onFrameKeydown, true);
        iframe.__juanjoHotkeyBound = true;
      } catch (_) { iframe.__juanjoHotkeyBound = true; }
    }

    iframe.addEventListener("load", bindNow);
    iframe.addEventListener("pointerdown", function () {
      if (iframe.id === IDS.FRAME) return;
      if (!getFullscreenElement()) forceHotkeyFocusFromIframe = true;
      window.setTimeout(syncHotkeyFocusLoop, 0);
    });
    bindNow();
  }

  function bindIframeHotkeys() {
    var iframes = document.getElementsByTagName("iframe");
    for (var i = 0; i < iframes.length; i++) attachHotkeyToIframe(iframes[i]);
  }

  // ─────────────────────────────────────────────
  //  Global event listeners
  // ─────────────────────────────────────────────
  window.addEventListener("keydown", handleHotkeyKeydown, true);
  window.addEventListener("focus",   syncHotkeyFocusLoop, true);
  document.addEventListener("focusin", syncHotkeyFocusLoop, true);
  document.addEventListener("fullscreenchange",       syncHotkeyFocusLoop);
  document.addEventListener("webkitfullscreenchange", syncHotkeyFocusLoop);
  document.addEventListener("pointerdown", function (event) {
    if (isGameIframe(event.target)) return;
    forceHotkeyFocusFromIframe = false;
    syncHotkeyFocusLoop();
  }, true);
  window.addEventListener("juanjo:toggle-classroom", function () { toggleClassroom(); });

  // ─────────────────────────────────────────────
  //  Public API (for settings.html and other pages)
  // ─────────────────────────────────────────────
  window.BudsinClassroomHotkey = {
    toggle:       toggleClassroom,
    getActiveUrl: getActiveUrl,
    KEYS:         KEYS,
  };

  // ─────────────────────────────────────────────
  //  Init
  // ─────────────────────────────────────────────
  createOverlay();
  resolveDisguisedPageData();
  window.setTimeout(preloadFrame, 0);
  ensureQuickToggleButton();
  bindIframeHotkeys();
  startActivityListeners();

})();
