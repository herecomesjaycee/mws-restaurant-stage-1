const restaurantDbPromise = '';

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

self.addEventListener('activate', function(event) {
  event.waitUntil(
    createDB()
  );
});

self.addEventListener('fetch', function(event) {
    const url = new URL(event.request.url);

    if (url.pathname.startsWith("/restaurant.html")) {
        event.respondWith(
            caches
                .match("restaurant.html")
                .then(response => response || fetch(event.request))
        );
        return;
    }

    event.respondWith(
        updateRestaurantObjs()
    )
});

function createDB(){
    idb.open('mws-restaurant', 1, upgradeDB => {
      upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
    });
}

function updateRestaurantObjs(restaurants){
     idb.open('mws-restaurant', 1).then(db => {
       const tx = db.transaction('restaurants', 'readwrite');
       var obj = {};
       restaurants.forEach(function(restaurant) {
        for (var p in restaurant) {
          obj[p] = restaurant[p];
        }
        tx.objectStore('objs').put({
          id: restaurant.id,
          data: obj
       });
      return tx.complete;
      });
    });
}


