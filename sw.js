self.addEventListener("install", function(event) {
    var urlsToCache = [
        "/",
        "/js/dbhelper.js",
        "/js/index.js",
        "/js/main.js",
        "/js/restaurant_info.js",
        "/data/restaurants.json",
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

self.addEventListener("fetch", function(event) {
    const url = new URL(event.request.url);

    if (url.pathname.startsWith("/restaurant.html")) {
        event.respondWith(
            caches
                .match("restaurant.html")
                .then(response => response || fetch(event.request))
        );
        return;
    }
});
