const CACHE_NAME = "panka-pdca-v25";
const BASE = new URL("./", self.location.href);
const urlsToCache = [
  new URL("./", BASE).href,
  new URL("./index.html", BASE).href,
  new URL("./manifest.json", BASE).href,
  new URL("./assets/index.js?v=25", BASE).href,
  new URL("./push-config.js?v=25", BASE).href,
  new URL("./push-client.js?v=25", BASE).href,
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

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch {
    data = { body: event.data ? event.data.text() : "記録の時間です" };
  }
  event.waitUntil(self.registration.showNotification(data.title || "PANKA PACE", {
    body: data.body || "記録の時間です",
    icon: "./icon-192.png?v=15",
    badge: "./icon-192.png?v=15",
    tag: data.tag || "panka-reminder",
    renotify: true,
    data: { url: data.url || "./" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "./", self.location.href).href;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      if (client.url.startsWith(new URL("./", self.location.href).href) && "focus" in client) {
        if ("navigate" in client) client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow ? self.clients.openWindow(target) : undefined;
  }));
});
