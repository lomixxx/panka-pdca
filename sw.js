const CACHE_NAME = "panka-pdca-v23";
const BASE = new URL("./", self.location.href);
const urlsToCache = [
  new URL("./", BASE).href,
  new URL("./index.html", BASE).href,
  new URL("./manifest.json", BASE).href,
  new URL("./assets/index.js?v=23", BASE).href,
  ...[
    "panka_01_unrecorded.png", "panka_02_excellent.png",
    "panka_03_good.png", "panka_04_slow.png",
    "panka_05_very_slow.png", "panka_06_broken_streak.png",
    "panka_07_long_absence.png", "panka_08_restart.png",
    "panka_09_streak.png", "panka_10_long_streak.png",
  ].map((name) => new URL(`./assets/panka/${name}?v=17`, BASE).href),
  new URL("./icon-192.png?v=15", BASE).href,
  new URL("./icon-512.png?v=15", BASE).href,
  new URL("./apple-touch-icon.png?v=15", BASE).href,
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
