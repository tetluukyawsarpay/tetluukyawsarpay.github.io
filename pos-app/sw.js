const CACHE = "tlk-phone-v9";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./logo.js",
  "https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.allSettled(ASSETS.map(a => c.add(a))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => { e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.mode === "navigate") {
    // pages: network first so new versions arrive immediately,
    // cache only as an offline fallback
    e.respondWith(fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put("./index.html", copy));
      return r;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
