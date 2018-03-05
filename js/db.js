/* --- VARIABLES --- */
var search_result = "";
var username = "root", password = "admin";
/* --- VARIABLES --- */

DB.connect("misty-shape-74", true);
//Wait for connection
DB.ready().then(function() {
  console.log("Verbunden");
});



function register(data) {
  var username = data[0].value;
  var password = data[1].value;
  var password_2 = data[2].value;

  if(username.length > 4) {
    if(password.length != 0) {
      if(password.length > 5) {
        if(password === password_2) {
          DB.User.register(username, password).then(function() {
          });
        } else errormessage("Passwörter stimmen nicht überein.");
      } else errormessage("Passwort ist zu kurz.");
    } else errormessage("Bitte gebe ein Passwort ein.");
  } else errormessage("Benutzername ist zu kurz.");

  console.log(password.length);
}

function errormessage(message) {
  $('.alert').html(message);
  $('.alert').toggle("slow").delay(2000).toggle("slow");
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
