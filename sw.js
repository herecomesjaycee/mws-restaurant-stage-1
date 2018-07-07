self.importScripts("./js/idb.js");

const staticCacheName = "restaurant-static";
const staticImgsCache = "restaurant-content-imgs";
const allCacheNames = [staticCacheName, staticImgsCache];

const dbPromise = idb.open("mws-restaurant", 1, upgradeDb => {
  switch (upgradeDb.oldVersion) {
    case 0:
      var restaurantsStore = upgradeDb.createObjectStore("restaurants", {
        keyPath: "id",
        autoIncrement: true
      });
      var ReviewsStore = upgradeDb.createObjectStore("reviews", {
        keyPath: "id",
        autoIncrement: true
      });
      var ownReviews = upgradeDb.createObjectStore("ownReviews", {
        keyPath: "id",
        autoIncrement: true
      });
  }
});

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


self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('sync', event => {
  if (event.tag === "postReview") {
    dbPromise
      .then(db => {
        return db
          .transaction("ownReviews")
          .objectStore("ownReviews")
          .getAll();
      })
      .then(reviews => {
        const reviewPromises = [];
        for (const review of reviews) {
          const { rating, name, comment, restaurant_id, createdAt } = review;
          reviewPromises.push(
            postReview({ rating, name, comments, restaurant_id, createdAt })
          );
        }
        return Promise.all(reviewPromises);
      })
      .then(reviews => {
        return dbPromise.then(db => {
          const tx = db.transaction("ownReviews", "readwrite");
          tx.objectStore("ownReviews").clear();
          return tx.complete;
        });
      })
      .catch(e => {
        console.log(e);
      });
    }
  console.log("sync event fired", event);
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
