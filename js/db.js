//Connect
DB.connect("toodle", true);
//Wait for connection
DB.ready().then(() => {
  $(".stats_content").text("Hello Baqend");
});
