DB.connect("toodle", true);
//Wait for connection
DB.ready().then(function() {
  console.log("Verbunden");
});

var search_field_input = $('#search_field_input');
search_field_input.click(function() {
  console.log(search_field_input);
})
