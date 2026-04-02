(function () {
  "use strict";

  var STORAGE_KEY = "budsin_site_theme";
  var DEFAULT_THEME = "light";
  var STYLE_ID = "budsin-theme-style";
  var BUTTON_ID = "budsin-theme-toggle";
  var FULLSCREEN_ID = "budsin-fullscreen-toggle";

  var THEMES = {
    light: {
      "--bg": "#edf1f5",
      "--bg-2": "#dfe6ee",
      "--surface": "rgba(255, 255, 255, 0.82)",
      "--surface-strong": "rgba(255, 255, 255, 0.96)",
      "--panel": "rgba(255, 255, 255, 0.9)",
      "--line": "rgba(18, 24, 38, 0.1)",
      "--text": "#111827",
      "--muted": "#5c6678",
      "--red": "#ef3f45",
      "--blue": "#2daeff",
      "--yellow": "#ffd84a",
      "--green": "#2fc98a",
      "--accent": "#ef3f45",
      "--accent-2": "#ff8c55",
      "--shadow": "0 24px 64px rgba(15, 23, 42, 0.12)",
      "--shadow-soft": "0 16px 36px rgba(15, 23, 42, 0.08)"
    },
    dark: {
      "--bg": "#0b1322",
      "--bg-2": "#111d33",
      "--surface": "rgba(12, 20, 36, 0.86)",
      "--surface-strong": "rgba(11, 19, 34, 0.96)",
      "--panel": "rgba(14, 24, 42, 0.92)",
      "--line": "rgba(180, 199, 223, 0.24)",
      "--text": "#e6edf8",
      "--muted": "#a4b6ce",
      "--red": "#ff686e",
      "--blue": "#61c3ff",
      "--yellow": "#ffd166",
      "--green": "#2fc98a",
      "--accent": "#61c3ff",
      "--accent-2": "#3a7fff",
      "--shadow": "0 24px 64px rgba(0, 0, 0, 0.42)",
      "--shadow-soft": "0 16px 36px rgba(0, 0, 0, 0.3)"
    }
  };

  function resolveTheme(theme) {
    return theme === "dark" ? "dark" : "light";
  }

  function getStoredTheme() {
    try {
      return resolveTheme(window.localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME);
    } catch (error) {
      return DEFAULT_THEME;
    }
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {}
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "html, body { transition: background-color 0.25s ease, color 0.25s ease; }",
      "html[data-site-theme='light'] { color-scheme: light; }",
      "html[data-site-theme='dark'] { color-scheme: dark; }",
      "body.budsin-theme-surface { color: var(--text, #111827) !important; }",
      "html[data-site-theme='light'] body.budsin-theme-surface {",
      "  background: radial-gradient(circle at top center, rgba(255, 216, 74, 0.34), transparent 26%), linear-gradient(180deg, #f7fafc 0%, var(--bg, #edf1f5) 48%, var(--bg-2, #dfe6ee) 100%) !important;",
      "}",
      "html[data-site-theme='dark'] body.budsin-theme-surface {",
      "  background: radial-gradient(circle at top left, rgba(255, 104, 110, 0.18), transparent 24%), radial-gradient(circle at bottom right, rgba(99, 212, 255, 0.16), transparent 28%), linear-gradient(180deg, #040814 0%, var(--bg, #08111f) 48%, var(--bg-2, #0c1730) 100%) !important;",
      "}",
      "html[data-site-theme='light'] body.budsin-game-only { background-color: #f7fafc !important; color: #111827 !important; }",
      "html[data-site-theme='dark'] body.budsin-game-only { background-color: #040814 !important; color: #eef6ff !important; }",
      "html[data-site-theme='light'] #message { background: rgba(255, 255, 255, 0.96) !important; color: #111827 !important; border: 1px solid rgba(18, 24, 38, 0.1); border-radius: 28px; box-shadow: 0 24px 64px rgba(15, 23, 42, 0.12) !important; }",
      "html[data-site-theme='dark'] #message { background: rgba(9, 15, 28, 0.96) !important; color: #eef6ff !important; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 28px; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.32) !important; }",
      "html[data-site-theme='dark'] #message h1, html[data-site-theme='dark'] #message h2, html[data-site-theme='dark'] #message h3, html[data-site-theme='dark'] #message p, html[data-site-theme='dark'] #message code { color: #eef6ff !important; }",
      "html[data-site-theme='light'] #message a { background: linear-gradient(135deg, #ef3f45, #ff8c55) !important; color: #ffffff !important; border-radius: 18px; text-transform: none; font-weight: 800; }",
      "html[data-site-theme='dark'] #message a { background: linear-gradient(135deg, #63d4ff, #2563eb) !important; color: #03111f !important; border-radius: 18px; text-transform: none; font-weight: 800; }",
      "html[data-site-theme='light'] #launch_countdown_screen { background: linear-gradient(180deg, rgba(247, 250, 252, 0.98), rgba(223, 230, 238, 0.98)) !important; color: #111827 !important; }",
      "html[data-site-theme='dark'] #launch_countdown_screen { background: linear-gradient(180deg, rgba(4, 8, 20, 0.98), rgba(8, 17, 31, 0.98)) !important; color: #eef6ff !important; }",
      "html[data-site-theme='light'] #launch_countdown_screen > div, html[data-site-theme='dark'] #launch_countdown_screen > div { padding: 24px 28px; border-radius: 28px; max-width: min(92vw, 720px); }",
      "html[data-site-theme='light'] #launch_countdown_screen > div { background: rgba(255, 255, 255, 0.9); box-shadow: 0 24px 64px rgba(15, 23, 42, 0.12); }",
      "html[data-site-theme='dark'] #launch_countdown_screen > div { background: rgba(9, 15, 28, 0.92); box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35); }",
      "html[data-site-theme='light'] #launch_countdown_screen h1, html[data-site-theme='light'] #launch_countdown_screen h2 { color: #111827 !important; }",
      "html[data-site-theme='dark'] #launch_countdown_screen h1, html[data-site-theme='dark'] #launch_countdown_screen h2 { color: #eef6ff !important; }",
      "html[data-site-theme='light'] #skipCountdown { background: linear-gradient(135deg, #ef3f45, #ff8c55); color: #ffffff; border: 0; border-radius: 16px; min-height: 46px; padding: 0 18px; font: inherit; font-weight: 800; cursor: pointer; }",
      "html[data-site-theme='dark'] #skipCountdown { background: linear-gradient(135deg, #63d4ff, #2563eb); color: #03111f; border: 0; border-radius: 16px; min-height: 46px; padding: 0 18px; font: inherit; font-weight: 800; cursor: pointer; }",
      "html[data-site-theme='light'] #topBar { background: rgba(255, 255, 255, 0.78) !important; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12); }",
      "html[data-site-theme='dark'] #topBar { background: rgba(8, 17, 31, 0.82) !important; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28); }",
      "html[data-site-theme='light'] #topBar a, html[data-site-theme='light'] #topBar div { color: #111827 !important; text-shadow: none !important; }",
      "html[data-site-theme='dark'] #topBar a, html[data-site-theme='dark'] #topBar div { color: #eef6ff !important; }",
      "html[data-site-theme='dark'] .topbar, html[data-site-theme='dark'] .frame-shell, html[data-site-theme='dark'] #unity-container, html[data-site-theme='dark'] #c2canvasdiv, html[data-site-theme='dark'] .note, html[data-site-theme='dark'] #loading-panel { border-color: rgba(148, 163, 184, 0.32) !important; }",
      "html[data-site-theme='dark'] .title, html[data-site-theme='dark'] .title strong { color: #eef6ff !important; }",
      "html[data-site-theme='dark'] .title span, html[data-site-theme='dark'] .note, html[data-site-theme='dark'] #loading-panel { color: #b4c6dc !important; }",
      "html[data-site-theme='dark'] .library { background: rgba(10, 18, 34, 0.84) !important; border-color: rgba(148, 163, 184, 0.28) !important; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35) !important; }",
      "html[data-site-theme='dark'] .games .game-card { background: rgba(9, 15, 28, 0.92) !important; border-color: rgba(148, 163, 184, 0.22) !important; color: #eef6ff !important; }",
      ".budsin-fullscreen-button { display: inline-flex; align-items: center; justify-content: center; min-height: 50px; padding: 0 20px; border: 0; border-radius: 18px; font: 800 14px/1 'Sora', system-ui, sans-serif; cursor: pointer; text-decoration: none; transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease; }",
      "html[data-site-theme='light'] .budsin-fullscreen-button { background: linear-gradient(135deg, #111827, #1f2937); color: #ffffff; }",
      "html[data-site-theme='dark'] .budsin-fullscreen-button { background: linear-gradient(135deg, #f8fafc, #dbe4f0); color: #111827; }",
      "#" + BUTTON_ID + " { position: fixed; left: 18px; bottom: 18px; z-index: 2147483000; display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 18px; border: 0; border-radius: 999px; font: 800 14px/1 'Sora', system-ui, sans-serif; cursor: pointer; box-shadow: 0 18px 34px rgba(15, 23, 42, 0.22); transition: transform 0.2s ease, filter 0.2s ease; }",
      "html[data-site-theme='light'] #" + BUTTON_ID + " { background: linear-gradient(135deg, #111827, #1f2937); color: #ffffff; }",
      "html[data-site-theme='dark'] #" + BUTTON_ID + " { background: linear-gradient(135deg, #f8fafc, #dbe4f0); color: #111827; }",
      "@media (max-width: 720px) { #" + BUTTON_ID + " { left: 12px; right: 12px; bottom: 12px; width: auto; } }"
    ].join("\n");

    document.head.appendChild(style);
  }

  function markPageType() {
    var body = document.body;
    if (!body) return;
    var isSurfacePage = !!document.querySelector(".shell, .topbar, .frame-shell, #message, #launch_countdown_screen, #loading-panel");
    body.classList.add(isSurfacePage ? "budsin-theme-surface" : "budsin-game-only");
  }

  function setThemeVariables(theme) {
    var root = document.documentElement;
    var palette = THEMES[theme] || THEMES[DEFAULT_THEME];
    Object.keys(palette).forEach(function (key) {
      root.style.setProperty(key, palette[key]);
    });
    root.dataset.siteTheme = theme;
    root.style.colorScheme = theme;
  }

  function updateButton(theme) {
    var button = document.getElementById(BUTTON_ID);
    if (!button) return;
    var nextTheme = theme === "dark" ? "light" : "dark";
    button.textContent = nextTheme === "dark" ? "Modo oscuro" : "Modo claro";
  }

  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function resolveFullscreenTarget() {
    return document.querySelector("#game-frame, .frame-shell iframe, iframe, .frame-shell, #unity-container, #c2canvasdiv");
  }

  function updateFullscreenButton() {
    var button = document.getElementById(FULLSCREEN_ID);
    if (!button) return;
    var isFullscreen = !!getFullscreenElement();
    button.textContent = isFullscreen ? "Salir de pantalla completa" : "Pantalla completa";
  }

  function ensureFullscreenButton() {
    if (document.getElementById(FULLSCREEN_ID) || !document.body) return;
    var button = document.createElement("button");
    button.id = FULLSCREEN_ID;
    button.className = "budsin-fullscreen-button";
    button.addEventListener("click", function () {
      if (getFullscreenElement()) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      } else {
        var target = resolveFullscreenTarget();
        if (target) (target.requestFullscreen || target.webkitRequestFullscreen).call(target);
      }
    });

    var topbar = document.querySelector(".topbar");
    if (topbar) topbar.appendChild(button);
    document.addEventListener("fullscreenchange", updateFullscreenButton);
    document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
    updateFullscreenButton();
  }

  function applyTheme(theme) {
    var resolved = resolveTheme(theme);
    setThemeVariables(resolved);
    updateButton(resolved);
    saveTheme(resolved);
  }

  function ensureButton() {
    if (document.getElementById(BUTTON_ID) || !document.body) return;
    var button = document.createElement("button");
    button.id = BUTTON_ID;
    button.addEventListener("click", function () {
      var current = resolveTheme(document.documentElement.dataset.siteTheme || getStoredTheme());
      applyTheme(current === "dark" ? "light" : "dark");
    });
    document.body.appendChild(button);
  }

  function init() {
    ensureStyle();
    markPageType();
    ensureButton();
    ensureFullscreenButton();
    applyTheme(getStoredTheme());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();