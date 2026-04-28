// public/sw.js — registrador del Service Worker de UV
importScripts("/uv/uv.bundle.js");
importScripts("/uv/uv.config.js");
importScripts("/uv/uv.sw.js");

const sw = new UVServiceWorker();

addEventListener("fetch", (event) =>
  event.respondWith(sw.fetch(event))
);
