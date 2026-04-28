// public/uv/uv.config.js
self.__uv$config = {
  // Prefijo de URL para el proxy (puedes cambiarlo)
  prefix: "/service/",

  // URL de tu bare server en Railway ← CAMBIA ESTO
  bare: "https://budsin-bare.onrender.com/bare/",

  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: "/uv/uv.handler.js",
  bundle: "/uv/uv.bundle.js",
  config: "/uv/uv.config.js",
  sw: "/uv/uv.sw.js",
};
