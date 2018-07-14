let restaurants, neighborhoods, cuisines;
var map;
var markers = [];
/**
 * Fetch neighborhoods and cuisines and favourite as soon as the page is loaded.
 */
window.onload = () => {
  fetchNeighborhoods();
  fetchCuisines();
  fetchFavourites();
};

/**
 * Fetch restaurants and set restaurant
 */
fetchRestaurants = () => {
  DBHelper.fetchRestaurants((error, restaurants) => {
    if (error) {
      // Got an error
      console.error(error);
    } else {
      self.restaurants = restaurants;
    }
  });
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) {
      // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Declare all favourite option and set their HTML.
 */
fetchFavourites = () => {
  const select = document.getElementById("favourites-select");
  const option = document.createElement("option");
  option.innerHTML = "My favourite";
  option.value = true;
  select.append(option);
};
/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById("neighborhoods-select");
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement("option");
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById("cuisines-select");

  cuisines.forEach(cuisine => {
    const option = document.createElement("option");
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById("cuisines-select");
  const nSelect = document.getElementById("neighborhoods-select");
  const fSelect = document.getElementById("favourites-select");

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;
  const fIndex = fSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;
  const favourite = fSelect[fIndex].value;

  DBHelper.fetchRestaurantByCuisineNeighborhoodAndFavourite(
    cuisine,
    neighborhood,
    favourite,
    (error, restaurants) => {
      if (error) {
        // Got an error!
        console.error(error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    }
  );
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById("restaurants-list");
  ul.innerHTML = "";

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById("restaurants-list");
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = restaurant => {
  const li = document.createElement("li");

  const image = document.createElement("img");
  image.className = "restaurant-img";
  image_url = DBHelper.imageUrlForRestaurant(restaurant);
  image.src = "../img/loading.webp";
  image.alt = `${restaurant.name} restaurant photo`;

  const image_link = document.createElement("a");
  image_link.id = "link-wrapper";
  image_link.innerHTML = `<img class=${image.classList} src=${image.src} data-src=${image_url} alt=${image.alt}>`;
  image_link.href = DBHelper.urlForRestaurant(restaurant);
  li.append(image_link);

  const name = document.createElement("h2");
  restaurant.is_favorite == true || restaurant.is_favorite == "true"
    ? (name.innerHTML = restaurant.name + ` [&hearts;]`)
    : (name.innerHTML = restaurant.name);
  li.append(name);

  const neighborhood = document.createElement("p");
  neighborhood.innerHTML = `&#127970 ` + restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement("p");
  address.innerHTML = `&#128205 ` + restaurant.address;
  li.append(address);

  const more = document.createElement("a");
  more.id = "view-details";
  more.innerHTML = "View Details";
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, "click", () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};

/** Lazy loading **/
window.addEventListener(
  "load",
  function() {
    var allimages = document.getElementsByClassName("restaurant-img");
    for (var i = 0; i < allimages.length; i++) {
      allimages[i].setAttribute("src", allimages[i].getAttribute("data-src"));
    }
  },
  false
);

var options = {
  root: document.querySelector('#maincontent'),
  rootMargin: '0px',
  threshold: 1.0
}

var observer = new IntersectionObserver(callback, options);

var target = document.querySelector('#restaurants-list');
observer.observe(target);

var callback = function(entries, observer) {
  entries.forEach(entry => {
    fillRestaurantsHTML()
  });
};
