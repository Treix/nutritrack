// NutriTrack Service Worker v6
// Must be hosted at /nutritrack/sw.js on GitHub Pages
var CACHE = 'nt-v6';
var SKIP_CACHE = [
  'anthropic.com',
  'corsproxy.io',
  'openfoodfacts.org',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com'
];

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Never cache API calls / external services
  for (var i = 0; i < SKIP_CACHE.length; i++) {
    if (url.includes(SKIP_CACHE[i])) {
      e.respondWith(
        fetch(e.request).catch(function() {
          return new Response('', { status: 503 });
        })
      );
      return;
    }
  }

  // Cache-first for app shell
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(resp) {
        if (resp.ok) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(c) {
            c.put(e.request, clone);
          });
        }
        return resp;
      }).catch(function() {
        // Offline fallback: return cached index
        return caches.match('/nutritrack/index.html') ||
               caches.match('/nutritrack/');
      });
    })
  );
});
