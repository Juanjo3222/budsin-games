importScripts("/scram/scramjet.all.js");

self.addEventListener("install", (e) => e.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

self.addEventListener("message", (event) => {
  if (event.data?.type === "init") {
    scramjet.config = event.data.config;
  }
});

self.addEventListener("fetch", (event) => {
  if (scramjet.config && scramjet.route(event)) {
    event.respondWith(scramjet.fetch(event));
  }
});
