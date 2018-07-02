/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
  }

  static get RESTAURANTS_URL() {
    const path = "restaurants"; // Change this to your server port
    return `${DBHelper.DATABASE_URL}/${path}/`;
  }

  static get REVIEWS_URL() {
    const path = "reviews"; // Change this to your server port
    return `${DBHelper.DATABASE_URL}/${path}/`;
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
          const request = indexedDB.open("mws-restaurant", 1);
          request.onsuccess = function(event) {
            const db = idb.open("mws-restaurant", 1).then(db => {
              const tx = db.transaction("restaurants", "readwrite");
              restaurants.forEach(function(restaurant) {
                let obj = {};
                for (var p in restaurant) {
                  obj[p] = restaurant[p];
                }
                tx.objectStore("restaurants").put({
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
        return db.transaction("mws-restaurant").objectStore("restaurants");
      });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchReviews(callback) {
    fetch(DBHelper.REVIEWS_URL)
      .then(function(response) {
        if (response.status !== 200) {
          console.log(
            "Looks like there was a problem. Status Code: " + response.status
          );
          return;
        }
        // Examine the text in the response
        response.json().then(function(data) {
          const reviews = data;
          const request = indexedDB.open("mws-restaurant", 1);
          request.onsuccess = function(event) {
            const db = idb.open("mws-restaurant", 1).then(db => {
              const tx = db.transaction("reviews", "readwrite");
              reviews.forEach(function(review) {
                let obj = {};
                for (var p in review) {
                  obj[p] = review[p];
                }
                tx.objectStore("reviews").put({
                  id: review.id,
                  data: obj
                });
                return tx.complete;
              });
            });
          };
          callback(null, reviews);
        });
      })
      .catch(function(err) {
        console.log("Fetch Error :-S", err);
        return db.transaction("mws-restaurant").objectStore("reviews");
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
    // fetch all restaurants with proper error handling.
    DBHelper.fetchReviews((error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant_reviews = reviews.filter(
          r => r.restaurant_id == parseInt(id)
        );
        if (restaurant_reviews) {
          // Got the restaurant_reviews
          callback(null, restaurant_reviews);
        } else {
          // Restaurant review(s) does not exist in the database
          callback("Restaurant review(s) does not exist", null);
        }
      }
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
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
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
  static createReview(review) {
    if (!review) return;

    fetch(`${DBHelper.REST_URL}/reviews`, {
      method: "POST",
      body: JSON.stringify(review)
    })
      .then(resp => {
        if (resp.status != 201) {
          console.log(`response was not successful. Response: ${resp.json()}`);
        }
        return resp.json();
      })
      .then(rev => {
        DBHelper.insertReviewInDb(rev, () => {
          console.log(`server record inserted ${rev.id}`);
        });
      })
      .catch(err => {
        console.error(err);
        return review;
      });
    return review;
  }
}
