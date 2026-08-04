const CACHE_NAME = "panka-pdca-v7";
const BASE = new URL("./", self.location.href);
const urlsToCache = [
  new URL("./", BASE).href,
  new URL("./index.html", BASE).href,
  new URL("./manifest.json", BASE).href,
  new URL("./assets/index.js?v=4", BASE).href,
  new URL("./icon-192.png", BASE).href,
  new URL("./icon-512.png", BASE).href,
  new URL("./apple-touch-icon.png", BASE).href,
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});