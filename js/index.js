function runServiceWorker() {
  if (!navigator.serviceWorker) return;
  navigator.serviceWorker
    .register("./js/sw.js")
    .then(function() {
      console.log("Success");
    })
    .catch(function() {
      console.log("Error");
    });
}
runServiceWorker();
