self.addEventListener("install", function(event) {
    var urlsToCache = [
        "/",
        "/js/dbhelper.js",
        "/js/index.js",
        "/js/main.js",
        "/js/restaurant_info.js",
        // "/data/restaurants.json",
        "/css/styles.css",
        "/index.html",
        "/restaurant.html"
    ];
    event.waitUntil(
        caches.open("restaurant-static").then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("activate", event => {
    console.log("Activating new service worker...");
    event.waitUntil(
        createDB();
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
        });
    );
});
self.addEventListener("fetch", function(event) {
    const url = new URL(event.request.url);
    console.log('hello')''
    if (url.pathname.startsWith("/restaurant.html")) {
        event.respondWith(
            caches
                .match("restaurant.html")
                .then(response => response || fetch(event.request))
        );
        return;
    }
});

createDB = () => {
    idb.open("mws-restaurant", 1, upgradeDB => {
        upgradeDB.createObjectStore("restaurants", { keyPath: "id" });
    });
};
