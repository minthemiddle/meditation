const cacheVersion = 'v0.1.0';

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(cacheVersion).then(function(cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/app.js',
                'https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css',
                'https://unpkg.com/alpinejs',
                'https://cdn.jsdelivr.net/npm/chart.js'
            ]);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName.startsWith('v') && cacheName !== cacheVersion;
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
        .then(function() {
            return self.clients.claim(); // Claim all clients immediately
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
