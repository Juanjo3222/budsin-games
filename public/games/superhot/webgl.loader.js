(function () {
  if (!window.Module) {
    window.Module = {};
  }

  var message = [
    "UnityLoader placeholder activo.",
    "Reemplaza public/games/superhot/webgl.loader.js por el loader real de SuperHot",
    "y agrega webgl.js/webgl.mem/webgl.data (o sus versiones .jsgz/.memgz/.datagz)."
  ].join(" ");

  console.warn(message);

  if (typeof Module.setStatus === "function") {
    Module.setStatus("Faltan archivos locales de SuperHot (loader/build).");
  }
})();
