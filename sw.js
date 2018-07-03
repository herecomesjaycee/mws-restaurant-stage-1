const staticCacheName = "restaurant-static";

self.addEventListener("install", function(event) {
    var urlsToCache = [
        "/",
        "/js/idb.js",
        "/js/dbhelper.js",
        "/js/index.js",
        "/js/main.js",
        "/js/restaurant_info.js",
        "/css/styles.css",
        "/index.html",
        "/restaurant.html"
    ];
    event.waitUntil(
        caches.open(staticCacheName).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("activate", event => {
    console.log("Activating new service worker...");
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(function(cacheName) {
                        return (
                            cacheName.startsWith("mws-") &&
                            cacheName != staticCacheName
                        );
                    })
                    .map(function(cacheName) {
                        return caches.delete(cacheName);
                    })
            ).then(() => {
                console.log("Service worker active");
            });
        })
    );
});
self.addEventListener("fetch", function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener("sync", function(event) {
    if (event.tag == "appSync") {
        // event.waitUntil();
    }
});
