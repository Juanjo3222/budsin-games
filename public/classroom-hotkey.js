(function () {
  "use strict";

  var CLASSROOM_URL = "https://docs.google.com/document/d/1gwlAb1OGRGyBkAvdOzILU-i9UquM4nauJ6X3uSnyUXE/edit?usp=sharing";
  var overlayId = "juanjo-classroom-overlay";
  var frameId = "juanjo-classroom-frame";
  var closeId = "juanjo-classroom-close";
  var loadedFlag = "data-loaded";

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
    close.setAttribute("aria-label", "Cerrar Canva");
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

  function toggleClassroom() {
    var overlay = createOverlay();
    var frame = document.getElementById(frameId);
    var isOpen = overlay.classList.contains("is-open");
    var willOpen = !isOpen;
    var fullscreenElement = getFullscreenElement();

    if (!isOpen && frame && !frame.getAttribute(loadedFlag)) {
      frame.src = CLASSROOM_URL;
      frame.setAttribute(loadedFlag, "true");
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
  window.addEventListener("juanjo:toggle-classroom", function () {
    toggleClassroom();
  });
})();
