DB.connect("toodle", true);
//Wait for connection
DB.ready().then(function() {
  console.log("Verbunden");
});
