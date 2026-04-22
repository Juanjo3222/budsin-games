(function () {
  "use strict";

  var CLASSROOM_DEFAULT_URL = "https://docs.google.com/document/d/1gwlAb1OGRGyBkAvdOzILU-i9UquM4nauJ6X3uSnyUXE/edit?usp=sharing";
  var CLASSROOM_URL_KEY = "budsin_classroom_url";
  var overlayId = "juanjo-classroom-overlay";
  var frameId = "juanjo-classroom-frame";
  var closeId = "juanjo-classroom-close";
  var quickToggleId = "juanjo-classroom-quick-toggle";
  var focusTrapId = "juanjo-classroom-focus-trap";
  var fullscreenHotkeyFocusInterval = null;
  var forceHotkeyFocusFromIframe = false;
  var loadedFlag = "data-loaded";
  var LANGUAGE_KEY = "budsin_language";
  var originalTitle = document.title;
  var originalFaviconHref = getFaviconHref();
  var disguisedTitle = "Google Docs";
  var disguisedFaviconHref = "https://www.google.com/favicon.ico";

  function resolveLanguage(language) {
    return language === "en" ? "en" : "es";
  }

  function getCurrentLanguage() {
    try {
      var url = new URL(window.location.href);
      var fromUrl = url.searchParams.get("lang");
      if (fromUrl) {
        var resolvedFromUrl = resolveLanguage(fromUrl);
        window.localStorage.setItem(LANGUAGE_KEY, resolvedFromUrl);
        return resolvedFromUrl;
      }
      return resolveLanguage(window.localStorage.getItem(LANGUAGE_KEY) || "es");
    } catch (error) {
      return "es";
    }
  }

  function getLocaleText() {
    if (getCurrentLanguage() === "en") {
      return {
        closeLabel: "Close cover mode",
        quickToggle: "Hide",
        quickToggleAria: "Toggle hidden mode"
      };
    }
    return {
      closeLabel: "Cerrar modo oculto",
      quickToggle: "Ocultar",
      quickToggleAria: "Activar modo ocultar"
    };
  }

  function shouldIgnoreTarget(target) {
    if (!target) return false;
    var tag = (target.tagName || "").toLowerCase();
    return (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      target.isContentEditable
    );
  }

  function getStoredClassroomUrl() {
    try {
      var stored = window.localStorage.getItem(CLASSROOM_URL_KEY);
      if (!stored) {
        return CLASSROOM_DEFAULT_URL;
      }
      var parsed = new URL(stored);
      return parsed.href;
    } catch (error) {
      return CLASSROOM_DEFAULT_URL;
    }
  }

  function getFaviconElement() {
    return document.querySelector("link[rel~='icon']") || null;
  }

  function getFaviconHref() {
    var faviconElement = getFaviconElement();
    if (!faviconElement) {
      return "";
    }

    return faviconElement.href || faviconElement.getAttribute("href") || "";
  }

  function setFaviconHref(href) {
    if (!href) {
      return;
    }

    var faviconElement = getFaviconElement();
    if (faviconElement) {
      faviconElement.href = href;
      return;
    }

    var link = document.createElement("link");
    link.rel = "icon";
    link.href = href;
    document.head.appendChild(link);
  }

  function resolveDisguisedPageData() {
    var classroomUrl = getStoredClassroomUrl();

    try {
      var parsed = new URL(classroomUrl);
      disguisedTitle = parsed.hostname.replace(/^www\./, "");
      disguisedFaviconHref = "https://www.google.com/s2/favicons?sz=64&domain_url=" + encodeURIComponent(parsed.origin);
    } catch (error) {
      disguisedTitle = "Google Docs";
      disguisedFaviconHref = "https://www.google.com/favicon.ico";
    }

    window.fetch(classroomUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Could not load disguise page");
        }
        return response.text();
      })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var remoteTitle = (doc.title || "").trim();
        var iconElement = doc.querySelector("link[rel~='icon']");
        var remoteIcon = iconElement ? (iconElement.getAttribute("href") || "").trim() : "";

        if (remoteTitle) {
          disguisedTitle = remoteTitle;
        }

        if (remoteIcon) {
          try {
            disguisedFaviconHref = new URL(remoteIcon, classroomUrl).href;
          } catch (error) {
            // Keep fallback favicon when remote icon URL is invalid.
          }
        }
      })
      .catch(function () {
        // Keep hostname title/favicon fallback when metadata is blocked.
      });
  }

  function createOverlay() {
    if (document.getElementById(overlayId)) {
      return document.getElementById(overlayId);
    }

    var style = document.createElement("style");
    style.textContent =
      "#" + overlayId + "{" +
      "position:fixed;" +
      "inset:0;" +
      "z-index:999999;" +
      "display:none;" +
      "background:#0b1220;" +
      "}" +
      "#" + overlayId + ".is-open{" +
      "display:block;" +
      "}" +
      "#" + overlayId + " iframe{" +
      "width:100%;" +
      "height:100%;" +
      "border:0;" +
      "display:block;" +
      "background:#fff;" +
      "}" +
      "#" + closeId + "{" +
      "position:fixed;" +
      "top:14px;" +
      "right:14px;" +
      "z-index:1000000;" +
      "width:44px;" +
      "height:44px;" +
      "border:0;" +
      "border-radius:999px;" +
      "background:rgba(15,23,42,.82);" +
      "color:#fff;" +
      "font:700 28px/1 Arial,sans-serif;" +
      "cursor:pointer;" +
      "display:flex;" +
      "align-items:center;" +
      "justify-content:center;" +
      "backdrop-filter:blur(8px);" +
      "}" +
      "#" + closeId + ":hover{" +
      "background:rgba(30,41,59,.92);" +
      "}" +
      "#" + quickToggleId + "{" +
      "position:fixed;" +
      "left:14px;" +
      "bottom:14px;" +
      "z-index:1000001;" +
      "min-height:40px;" +
      "padding:0 14px;" +
      "border:0;" +
      "border-radius:999px;" +
      "background:rgba(15,23,42,.82);" +
      "color:#fff;" +
      "font:700 12px/1 Arial,sans-serif;" +
      "cursor:pointer;" +
      "display:inline-flex;" +
      "align-items:center;" +
      "justify-content:center;" +
      "backdrop-filter:blur(8px);" +
      "}" +
      "#" + quickToggleId + ":hover{" +
      "background:rgba(30,41,59,.92);" +
      "}" +
      "body.juanjo-classroom-open{" +
      "overflow:hidden;" +
      "}";
    document.head.appendChild(style);

    var overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.setAttribute("aria-hidden", "true");

    var close = document.createElement("button");
    close.id = closeId;
    close.type = "button";
    close.setAttribute("aria-label", getLocaleText().closeLabel);
    close.textContent = "×";
    close.addEventListener("click", toggleClassroom);

    var frame = document.createElement("iframe");
    frame.id = frameId;
    frame.setAttribute("allow", "fullscreen");
    frame.setAttribute("allowfullscreen", "");
    frame.setAttribute(
      "sandbox",
      "allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
    );

    overlay.appendChild(close);
    overlay.appendChild(frame);
    document.body.appendChild(overlay);

    return overlay;
  }

  function createFunkinTimestamp() {
    var fromFloat = window.haxe_Int64Helper && window.haxe_Int64Helper.fromFloat;
    var now = window.performance && typeof window.performance.now === "function"
      ? window.performance.now()
      : Date.now();

    if (fromFloat) {
      return fromFloat(now);
    }

    return { high: 0, low: now | 0 };
  }

  function triggerFunkinEscape() {
    var flixel = window.flixel_FlxG;
    var game = flixel && flixel.game;
    var openfl = window.openfl_Lib;
    var current = openfl && openfl.get_current && openfl.get_current();
    var stage = current && current.stage;
    var targetWindow = stage && stage.application && stage.application.__window
      ? stage.application.__window
      : stage && stage.window;
    var modifier = 0;
    var keyCode = 27;

    if (!game || !targetWindow) {
      return;
    }

    if (targetWindow.onKeyDown) {
      targetWindow.onKeyDown.dispatch(keyCode, modifier);
    }

    if (targetWindow.onKeyDownPrecise) {
      targetWindow.onKeyDownPrecise.dispatch(keyCode, modifier, createFunkinTimestamp());
    }

    if (targetWindow.onKeyUp) {
      targetWindow.onKeyUp.dispatch(keyCode, modifier);
    }

    if (targetWindow.onKeyUpPrecise) {
      targetWindow.onKeyUpPrecise.dispatch(keyCode, modifier, createFunkinTimestamp());
    }
  }

  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    }

    if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
      return null;
    }

    return null;
  }

  function applyOverlayState(overlay, willOpen) {
    overlay.classList.toggle("is-open", willOpen);
    document.body.classList.toggle("juanjo-classroom-open", willOpen);
    overlay.setAttribute("aria-hidden", willOpen ? "false" : "true");
    document.title = willOpen ? disguisedTitle : originalTitle;
    setFaviconHref(willOpen ? disguisedFaviconHref : originalFaviconHref);
  }

  function waitForFullscreenExit(callback) {
    var resolved = false;

    function finish() {
      if (resolved) {
        return;
      }

      resolved = true;
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      callback();
    }

    function onChange() {
      if (!getFullscreenElement()) {
        finish();
      }
    }

    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    window.setTimeout(finish, 400);
  }



  function ensureClassroomFrameUrl(frame) {
    if (!frame) {
      return;
    }

    var classroomUrl = getStoredClassroomUrl();
    if (!frame.getAttribute(loadedFlag) || frame.src !== classroomUrl) {
      frame.src = classroomUrl;
      frame.setAttribute(loadedFlag, "true");
    }
  }

  function preloadClassroomUrl() {
    var frame = document.getElementById(frameId);

    if (!frame) {
      return;
    }

    ensureClassroomFrameUrl(frame);
  }

  function toggleClassroom() {
    var overlay = createOverlay();
    var frame = document.getElementById(frameId);
    var isOpen = overlay.classList.contains("is-open");
    var willOpen = !isOpen;
    var fullscreenElement = getFullscreenElement();

    if (!isOpen && frame) {
      ensureClassroomFrameUrl(frame);
    }

    triggerFunkinEscape();

    if (willOpen && fullscreenElement) {
      waitForFullscreenExit(function () {
        applyOverlayState(overlay, true);
      });
      exitFullscreen();
      return;
    }

    applyOverlayState(overlay, willOpen);
  }

  function ensureQuickToggleButton() {
    if (document.getElementById(quickToggleId)) {
      return;
    }

    var button = document.createElement("button");
    button.id = quickToggleId;
    button.type = "button";
    button.textContent = getLocaleText().quickToggle;
    button.setAttribute("aria-label", getLocaleText().quickToggleAria);
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      toggleClassroom();
    });

    document.body.appendChild(button);
  }

  function ensureFocusTrap() {
    var focusTrap = document.getElementById(focusTrapId);

    if (focusTrap) {
      return focusTrap;
    }

    focusTrap = document.createElement("button");
    focusTrap.id = focusTrapId;
    focusTrap.type = "button";
    focusTrap.setAttribute("aria-hidden", "true");
    focusTrap.tabIndex = -1;
    focusTrap.style.position = "fixed";
    focusTrap.style.left = "-9999px";
    focusTrap.style.top = "-9999px";
    focusTrap.style.width = "1px";
    focusTrap.style.height = "1px";
    focusTrap.style.opacity = "0";
    focusTrap.style.pointerEvents = "none";

    document.body.appendChild(focusTrap);
    return focusTrap;
  }

  function recoverPageHotkeyFocus() {
    var focusTrap = ensureFocusTrap();

    if (!focusTrap || typeof focusTrap.focus !== "function") {
      return;
    }

    try {
      focusTrap.focus({ preventScroll: true });
    } catch (error) {
      focusTrap.focus();
    }
  }

  function clearFullscreenHotkeyFocusLoop() {
    if (!fullscreenHotkeyFocusInterval) {
      return;
    }

    window.clearInterval(fullscreenHotkeyFocusInterval);
    fullscreenHotkeyFocusInterval = null;
  }

  function isGameIframeElement(element) {
    return element &&
      element.tagName &&
      element.tagName.toLowerCase() === "iframe" &&
      element.id !== frameId;
  }

  function shouldForceHotkeyFocus() {
    var fullscreenElement = getFullscreenElement();

    if (isGameIframeElement(fullscreenElement)) {
      return true;
    }

    if (forceHotkeyFocusFromIframe) {
      return true;
    }

    var activeElement = document.activeElement;
    return isGameIframeElement(activeElement);
  }

  function syncFullscreenHotkeyFocusLoop() {
    if (!shouldForceHotkeyFocus()) {
      clearFullscreenHotkeyFocusLoop();
      return;
    }

    recoverPageHotkeyFocus();

    if (!fullscreenHotkeyFocusInterval) {
      fullscreenHotkeyFocusInterval = window.setInterval(function () {
        if (!shouldForceHotkeyFocus()) {
          clearFullscreenHotkeyFocusLoop();
          return;
        }

        recoverPageHotkeyFocus();
      }, 350);
    }
  }

  function attachHotkeyToIframe(iframe) {
    if (!iframe || iframe.__juanjoHotkeyBound) {
      return;
    }

    function onFrameKeydown(event) {
      if (event.defaultPrevented || shouldIgnoreTarget(event.target)) {
        return;
      }

      if (isToggleHotkey(event)) {
        event.preventDefault();
        event.stopPropagation();
        toggleClassroom();
      }
    }

    function bindNow() {
      try {
        if (!iframe.contentWindow || !iframe.contentDocument) {
          return;
        }

        iframe.contentWindow.addEventListener("keydown", onFrameKeydown, true);
        iframe.contentDocument.addEventListener("keydown", onFrameKeydown, true);
        iframe.__juanjoHotkeyBound = true;
      } catch (error) {
        iframe.__juanjoHotkeyBound = true;
      }
    }

    iframe.addEventListener("load", bindNow);
    iframe.addEventListener("pointerdown", function () {
      if (iframe.id === frameId) {
        return;
      }

      if (!getFullscreenElement()) {
        forceHotkeyFocusFromIframe = true;
      }

      window.setTimeout(syncFullscreenHotkeyFocusLoop, 0);
    });
    bindNow();
  }

  function bindIframeHotkeys() {
    var iframes = document.getElementsByTagName("iframe");
    for (var i = 0; i < iframes.length; i += 1) {
      attachHotkeyToIframe(iframes[i]);
    }
  }

  function isToggleHotkey(event) {
    var key = event.key || "";
    var code = event.code || "";

    return (
      key === "|" ||
      key === "°" ||
      key === "º" ||
      code === "Backquote" ||
      code === "IntlBackslash"
    );
  }

  function handleHotkeyKeydown(event) {
    if (event.defaultPrevented || shouldIgnoreTarget(event.target)) {
      return;
    }

    if (isToggleHotkey(event)) {
      event.preventDefault();
      event.stopPropagation();
      toggleClassroom();
    }
  }

  window.addEventListener("keydown", handleHotkeyKeydown, true);
  window.addEventListener("focus", syncFullscreenHotkeyFocusLoop, true);
  document.addEventListener("focusin", syncFullscreenHotkeyFocusLoop, true);
  document.addEventListener("fullscreenchange", syncFullscreenHotkeyFocusLoop);
  document.addEventListener("webkitfullscreenchange", syncFullscreenHotkeyFocusLoop);
  document.addEventListener("pointerdown", function (event) {
    if (isGameIframeElement(event.target)) {
      return;
    }

    forceHotkeyFocusFromIframe = false;
    syncFullscreenHotkeyFocusLoop();
  }, true);
  window.addEventListener("juanjo:toggle-classroom", function () {
    toggleClassroom();
  });
  createOverlay();
  resolveDisguisedPageData();
  window.setTimeout(preloadClassroomUrl, 0);
  ensureQuickToggleButton();
  bindIframeHotkeys();
})();
