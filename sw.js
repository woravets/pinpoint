const CACHE_NAME = 'pinpoint-android-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/base.css',
  './assets/css/layout.css',
  './assets/css/map.css',
  './assets/css/components.css',
  './assets/js/db.js',
  './assets/js/picker.js',
  './assets/js/map.js',
  './assets/js/gps.js',
  './assets/js/app.js',
  './assets/js/types.js',
  './assets/js/place.js',
  './assets/js/history.js',
  './assets/js/settings.js',
  './assets/js/ui.js',
  './assets/js/detail.js',
  './assets/js/boot.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('maps.googleapis.com')) return;
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
