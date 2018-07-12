/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Indexed db version
   */
  static get DB_VER() {
    return 1;
  }
  /**
   * Indexed db name
   */
  static get DB_NAME() {
    return "mws-restaurant";
  }
  /**
   * Indexed db store.restaurants
   */
  static get RESTAURANTS_STORE() {
    return "restaurants";
  }
  /**
   * Indexed db store.reviews
   */
  static get REVIEWS_STORE() {
    return "reviews";
  }
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
  }

  static get RESTAURANTS_URL() {
    const path = DBHelper.RESTAURANTS_STORE; // Change this to your server port
    return `${DBHelper.DATABASE_URL}/${path}/`;
  }

  static get REVIEWS_URL() {
    const path = DBHelper.REVIEWS_STORE; // Change this to your server port
    return `${DBHelper.DATABASE_URL}/${path}/`;
  }

  static get RESTAURANT_REVIEWS_URL() {
    const path = DBHelper.REVIEWS_STORE; // Change this to your server port
    return `${DBHelper.DATABASE_URL}/${path}/?restaurant_id=`;
  }

  /**
   * Get indexed database promise
   */
  static retrieveDB() {
    return idb.open(DBHelper.DB_NAME, DBHelper.DB_VER, upgrade => {
      const storeRestaurants = upgrade.createObjectStore(
        DBHelper.RESTAURANTS_STORE,
        {
          keyPath: "id",
          autoIncrement: true
        }
      );
      // values for pendingUpdate 'yes', 'no' are used instead of boolean because IndexedDb doesn't support index on boolean column
      // due to many possible 'falsy' values
      storeRestaurants.createIndex("pending-updates", "pendingUpdate", {
        unique: false
      });

      const storeReviews = upgrade.createObjectStore(DBHelper.REVIEWS_STORE, {
        keyPath: "id",
        autoIncrement: true
      });

      storeReviews.createIndex("pending-updates", "pendingUpdate", {
        unique: false
      });
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(DBHelper.RESTAURANTS_URL)
      .then(function(response) {
        if (response.status !== 200) {
          console.log(
            "Looks like there was a problem. Status Code: " + response.status
          );
        }
        // Examine the text in the response
        response.json().then(function(data) {
          const restaurants = data;
          const request = indexedDB.open(DBHelper.DB_NAME, 1);
          request.onsuccess = function(event) {
            const db = idb.open(DBHelper.DB_NAME, 1).then(db => {
              const tx = db.transaction(
                DBHelper.RESTAURANTS_STORE,
                "readwrite"
              );
              restaurants.forEach(function(restaurant) {
                let obj = {};
                for (var p in restaurant) {
                  obj[p] = restaurant[p];
                }
                tx.objectStore(DBHelper.RESTAURANTS_STORE).put({
                  id: restaurant.id,
                  data: obj
                });
                return tx.complete;
              });
            });
          };
          callback(null, restaurants);
        });
      })
      .catch(function(err) {
        console.log("Fetch Error :-S", err);
        return db
          .transaction(DBHelper.DB_NAME)
          .objectStore(DBHelper.RESTAURANTS_STORE);
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback("Restaurant does not exist", null);
        }
      }
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchReviewsByRestaurantId(id, callback) {
    fetch(DBHelper.RESTAURANT_REVIEWS_URL + id)
      .then(function(response) {
        if (response.status !== 200) {
          console.log(
            "Looks like there was a problem. Status Code: " + response.status
          );
        }
        // Examine the text in the response
        response.json().then(function(data) {
          const reviews = data;
          const db = idb.open(DBHelper.DB_NAME, 1).then(db => {
            const tx = db.transaction(DBHelper.REVIEWS_STORE, "readwrite");
            reviews.forEach(function(review) {
              let obj = {};
              for (var p in review) {
                obj[p] = review[p];
              }
              tx.objectStore(DBHelper.REVIEWS_STORE).put({
                id: review.id,
                data: obj
              });
              return tx.complete;
            });
          });
          callback(null, reviews);
        });
      })
      .catch(function(err) {
        console.log("Fetch Error :-S", err);
      });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineNeighborhoodAndFavourite(
    cuisine,
    neighborhood,
    favourite,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        if (favourite != "all") {
          //filter by favourite
          results = results.filter(
            r =>
              r.is_favorite == favourite ||
              r.is_favorite == favourite.toString()
          );
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `/img/${restaurant.photograph}.webp`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }

  /**
   * Create user review, send to server and create an object in db
   * @param {Object} review
   */
  static postReview(review) {
    console.log(review);
    if (!review) return;
    console.log(`${DBHelper.REVIEWS_URL}`);
    fetch(`${DBHelper.REVIEWS_URL}`, {
      method: "post",
      body: JSON.stringify(review)
    })
      .then(response => {
        return response.json();
      })
      .then(review => {
        review.toBeUpdated = true;
        const db = idb.open(DBHelper.DB_NAME, 1).then(db => {
          const tx = db.transaction(DBHelper.REVIEWS_STORE, "readwrite");
          tx.objectStore(DBHelper.REVIEWS_STORE).put({
            id: review.id,
            data: review
          });
          return tx.complete;
        });
      })
      .catch(err => {
        console.error(err);
        return review;
      });
    return review;
  }

  static favoriteRestaurant(restaurant, state) {
    if (!restaurant || typeof state !== "boolean") return;

    restaurant.is_favorite = state;

    fetch(`${DBHelper.RESTAURANTS_URL}${restaurant.id}/?is_favorite=${state}`, {
      method: "PUT"
    })
      .then(resp => {
        if (resp.status != 200)
          console.info(`Response was not successful. Response: ${resp}`);
        restaurant.pendingUpdate = "no";
      })
      .catch(e => {
        console.log(e);
        restaurant.pendingUpdate = "yes";
      });
    DBHelper.updateRestaurantInDb(restaurant);
    //TO-DO : write updateRestaurantInDb
  }

  /**
   * Fetch unsynced reviews
   */
  static syncOfflineReviewsAndPendingRestaurantUpdate() {
    syncOfflineReviews;
    syncRestaurantFlag;
  }

  syncOfflineReviews() {
    const db = idb
      .open(DBHelper.DB_NAME, 1)
      .then(db => {
        return db
          .transaction("reviews")
          .objectStore("reviews")
          .getAll();
      })
      .then(allObjs => {
        let unsyncedReviews = [];
        allObjs.forEach(item => {
          item.reviews.forEach(review => {
            if (review.toBeUpdated) {
              unsyncedReviews.push(review);
              delete review.toBeUpdated;
            }
          });
        });
        unsyncedReviews.forEach(item => {
          const body = {
            restaurant_id: item.restaurant_id,
            name: item.name,
            rating: item.rating,
            comments: item.comments,
            updatedAt: item.updatedAt
          };
          fetch(DBHelper.REVIEWS_URL, {
            method: "post",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
          }).then(res =>
            console.log("review synced with the server", res.json())
          );
        });
      });
  }
}
