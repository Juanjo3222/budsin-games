(function () {
  "use strict";

  var STORAGE_KEY = "budsin_site_theme";
  var DEFAULT_THEME = "light";
  var STYLE_ID = "budsin-theme-style";
  var BUTTON_ID = "budsin-theme-toggle";

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
      "--bg": "#08111f",
      "--bg-2": "#0c1730",
      "--surface": "rgba(10, 18, 36, 0.84)",
      "--surface-strong": "rgba(9, 15, 28, 0.96)",
      "--panel": "rgba(10, 18, 36, 0.92)",
      "--line": "rgba(255, 255, 255, 0.12)",
      "--text": "#eef6ff",
      "--muted": "#b4c6dc",
      "--red": "#ff686e",
      "--blue": "#63d4ff",
      "--yellow": "#ffd166",
      "--green": "#2fc98a",
      "--accent": "#63d4ff",
      "--accent-2": "#2563eb",
      "--shadow": "0 24px 64px rgba(0, 0, 0, 0.35)",
      "--shadow-soft": "0 16px 36px rgba(0, 0, 0, 0.24)"
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
      "#" + BUTTON_ID + " { position: fixed; left: 18px; bottom: 18px; z-index: 2147483000; display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 18px; border: 0; border-radius: 999px; font: 800 14px/1 'Sora', system-ui, sans-serif; cursor: pointer; box-shadow: 0 18px 34px rgba(15, 23, 42, 0.22); transition: transform 0.2s ease, filter 0.2s ease; }",
      "#" + BUTTON_ID + ":hover { transform: translateY(-2px); filter: brightness(1.02); }",
      "html[data-site-theme='light'] #" + BUTTON_ID + " { background: linear-gradient(135deg, #111827, #1f2937); color: #ffffff; }",
      "html[data-site-theme='dark'] #" + BUTTON_ID + " { background: linear-gradient(135deg, #f8fafc, #dbe4f0); color: #111827; }",
      "@media (max-width: 720px) { #" + BUTTON_ID + " { left: 12px; right: 12px; bottom: 12px; width: auto; justify-content: center; } }"
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
    button.setAttribute("aria-label", nextTheme === "dark" ? "Cambiar a modo oscuro" : "Cambiar a modo claro");
    button.setAttribute("title", nextTheme === "dark" ? "Cambiar a modo oscuro" : "Cambiar a modo claro");
  }

  function applyTheme(theme) {
    var resolved = resolveTheme(theme);
    setThemeVariables(resolved);
    updateButton(resolved);
    saveTheme(resolved);
  }

  function ensureButton() {
    if (document.getElementById(BUTTON_ID) || !document.body) {
      return;
    }

    var button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
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
    applyTheme(getStoredTheme());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
