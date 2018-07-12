let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName("id");
  if (!id) {
    // no id found in URL
    error = "No restaurant id in URL";
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById("restaurant-name");
  restaurant.is_favorite
    ? (name.innerHTML = restaurant.name + ` [&hearts;]`)
    : (name.innerHTML = restaurant.name);

  const button = document.getElementById("favourite-button");
  restaurant.is_favorite
    ? (button.innerHTML = "Remove from your favourite list")
    : (button.innerHTML = "Add to your favourite list");

  const address = document.getElementById("restaurant-address");
  address.innerHTML = restaurant.address;

  const image = document.getElementById("restaurant-img");
  image.className = "restaurant-img";
  image.alt = `Image of ${restaurant.name}`;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById("restaurant-cuisine");
  cuisine.innerHTML = restaurant.cuisine_type;

  //update form for resturant id
  updateFormRestaurantId(restaurant);

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById("restaurant-hours");
  for (let key in operatingHours) {
    const row = document.createElement("tr");

    const day = document.createElement("td");
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement("td");
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

fillReviewsHTML = (restaurant = self.restaurant) => {
  if (self.restaurant.reviews) {
    console.log("hi");
    renderReviews(self.restaurant.reviews);
  } else {
    DBHelper.fetchReviewsByRestaurantId(restaurant.id, (error, reviews) => {
      self.restaurant.reviews = reviews;
      renderReviews(self.restaurant.reviews);
    });
  }
};

/**
 * Render reviews
 * @param {Array} reviewsList - array of restaurant reviews
 */
renderReviews = reviewsList => {
  // sort reviews by latest
  reviewsList.sort((r1, r2) => r2.createdAt - r1.createdAt);

  const ul = document.getElementById("reviews-list"),
    fragment = document.createDocumentFragment();

  if (!reviewsList || (reviewsList && reviewsList.length === 0)) {
    const noReviews = document.createElement("p");
    noReviews.innerHTML = "No reviews yet!";
    ul.appendChild(noReviews);
    return;
  }

  reviewsList.forEach(review => {
    fragment.append(createReviewHTML(review));
  });

  ul.appendChild(fragment);
};
/**
 * Render reviews
 * @param {object} reviews - a new restaurant review
 */
renderReview = review => {
  // sort reviews by latest
  const ul = document.getElementById("reviews-list"),
    fragment = document.createDocumentFragment();
  fragment.append(createReviewHTML(review));
  ul.appendChild(fragment);
};
/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
  const li = document.createElement("li");
  const name = document.createElement("p");
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement("p");
  date.innerHTML = new Date(review.createdAt).toDateString();
  li.appendChild(date);

  const rating = document.createElement("p");
  rating.innerHTML = `Rating: ${review.rating}/5`;
  li.appendChild(rating);

  const comments = document.createElement("p");
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById("breadcrumb");
  const li = document.createElement("li");
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

updateFormRestaurantId = restaurant => {
  const el = document.getElementById("restaurant_id");
  el.value = restaurant.id;
};

/**
 * Favorite/unfavorite restaurant
 * @param {Object} target - event target
 * @param {Object} restaurant
 */
favoriteRestaurant = (restaurant = self.restaurant) => {
  if (restaurant.is_favorite) {
    DBHelper.favoriteRestaurant(restaurant, false);
    fillRestaurantHTML();
  } else {
    DBHelper.favoriteRestaurant(restaurant, true);
    fillRestaurantHTML();
  }
};

postReview = () => {
  const reviewer_name = document.getElementById("name").value;
  const rating = document.querySelector('input[name="rating"]:checked').value;
  const comments = document.getElementById("comments").value;
  const restaurant_id = document.getElementById("restaurant_id").value;

  review = {
    name: reviewer_name,
    rating: parseInt(rating),
    comments: comments,
    restaurant_id: parseInt(restaurant_id),
    createdAt: Date.now()
  };
  DBHelper.postReview(review);
  renderReview(review);
  resetReviewForm();
};

resetReviewForm = () => {
  document.getElementById("review-form").reset();
  document.getElementById("review-notice").innerHTML =
    "Thank you for your review!";
  document.getElementById("review-notice").classList.add("review-notice-style");
};
