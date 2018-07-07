const staticCacheName = "restaurant-static";
const staticImgsCache = "restaurant-content-imgs";
const allCacheNames = [staticCacheName, staticImgsCache];

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
                            !allCacheNames.includes(cacheName)
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
    var requestUrl = new URL(event.request.url);
    if (requestUrl.pathname.startsWith("/img")) {
        event.respondWith(servePhoto(event.request));
        return;
    }
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener("sync", function(event) {
    if (event.tag == "appSync") {
        // event.waitUntil(DBHelper.syncData());
    }
});

function servePhoto(request) {
    var requestUrl = request.url;
    return caches.open(staticImgsCache).then(function(cache) {
        return fetch(request).then(function(response) {
            cache.put(requestUrl, response.clone());
            return response;
        });
    });
}
