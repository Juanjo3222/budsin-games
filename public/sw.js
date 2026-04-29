const VERSION = "3";

importScripts("/scram/scramjet.all.js");

// Limpiar IndexedDB vieja antes de iniciar
self.addEventListener("install", (event) => {
  event.waitUntil(
    new Promise((resolve) => {
      const req = indexedDB.deleteDatabase("scramjet");
      req.onsuccess = resolve;
      req.onerror = resolve;
      req.onblocked = resolve;
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

self.addEventListener("fetch", (event) => {
  event.respondWith((async () => {
    await scramjet.loadConfig();
    if (scramjet.route(event)) {
      return scramjet.fetch(event);
    }
    return fetch(event.request);
  })());
});
