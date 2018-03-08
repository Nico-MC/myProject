/* --- VARIABLES --- */
var search_result = "";

DB.connect("misty-shape-74").then(function() {
  console.log("Verbunden");
});
//Wait for connection
DB.ready().then(function() {
  if (DB.User.me) {
    //do additional things if user is logged in
    console.log('Hello ' + DB.User.me.username); //the username of the user
    transferToLogin(false, DB.User.me.securitykey);
  } else {
    //do additional things if user is not logged in
    transferToRegister();
  }
});


function register(data, callback) {
  var username = data[0].value;
  var password = data[1].value;
  var password_2 = data[2].value;

  if(username.length != 0) {
    if(username.length > 3) {
      if(password.length != 0) {
        if(password.length > 4) {
          if(password === password_2) {
            DB.User.register(username, password).then(function() {
              registermessage(function() {
                // TODO Hier fehlt noch securitykey
                return callback();
              })
            });
          } else errormessage("Passwörter stimmen nicht überein.");
        } else errormessage("Passwort ist zu kurz.");
      } else errormessage("Bitte gebe ein Passwort ein.");
    } else errormessage("Benutzername ist zu kurz.");
  } else errormessage("Bitte gebe einen Namen ein.");
}

function login(data, callback) {
  var username = data[0].value;
  var password = data[1].value;

  DB.User.login(username, password).then(function() {
    return callback(DB.User.me.securitykey);
  }, function() {
    errormessage("Name oder Passwort ist nicht korrekt.");
  });
}

function logout() {
  DB.User.logout().then(function() {
    location.reload();
  });
}

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function search(search_result) {
  console.log(search_result);
}
