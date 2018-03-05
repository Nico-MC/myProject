/* --- VARIABLES --- */
var search_result = "";
var username = "root", password = "admin";
/* --- VARIABLES --- */

DB.connect("misty-shape-74", true);
//Wait for connection
DB.ready().then(function() {
  console.log("Verbunden");
});



function register() {
  DB.User.register(username, password).then(function() {
    //Hey we are logged in
    console.log(DB.User.me.username); //'john.doe@example.com'
  });
}

function login(username, password) {
  DB.User.login('john.doe@example.com', 'MySecretPassword').then(function() {
  //Hey we are logged in again
  console.log(DB.User.me.username); //'john.doe@example.com'
});
}

$('#search').submit(function(e) {
  e.preventDefault();
  search_result = $('#search_field').val();
});
