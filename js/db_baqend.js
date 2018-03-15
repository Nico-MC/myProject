/* --- VARIABLES --- */
var search_result = "";
var query;
$(document).ready(function() {
  DB.connect("misty-shape-74").then(function() {
    console.log("Verbunden");
  });
})
//Wait for connection
DB.ready().then(function() {
  if (DB.User.me) {
    //do additional things if user is logged in
    console.log('Willkommen ' + DB.User.me.username); //the username of the user
    transferToLogin(DB.User.me.securitykey, false, function() {
      // subscribeRealtime(DB.User.me.securitykey);
    });
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
            initUser(username, function(user, sk) {
              DB.User.register(user, password).then(function() {
                registermessage(function() {
                  return callback(sk);
                });
              });
            })
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

function subscribeRealtime(sk) {
  var query;
  if(DB.User.me.securitykey == sk) {
    DB.User.find(DB.User.me.id).singleResult(function(user) {
      var itemlist_ID = user.items.id;
      query = DB.Items.find(itemlist_ID);
    });
    setTimeout(function() {
      testWebsocketConnection();
      console.log("Subscribe Realtime queries ...");
      console.log(query);
      query.resultStream(function(result) {
        console.log(result)
      });
    }, 3000);
  }
}

function testWebsocketConnection() {
  var ws = new WebSocket('wss://app-starter.events.baqend.com/v1/events'); // also ws:// can be used
  ws.onopen = function() { console.log('opened') };
  ws.onclose = function() { console.log('closed') };
  //expect opened to be logged but closed is called immediately
}

function initUser(username, callback) {
  // items object for each individual user
  var items = new DB.Items(
    {
      'itemlist': new DB.List()
    }
  );
  items.save();

  console.log("Initialize User ...");
  // user object
  var user = new DB.User({
    'username': username,
    'securitykey': (CryptoJS.SHA256(username)).toString(CryptoJS.enc.Base64),
    'items': items
  });

  return callback(user, user.securitykey);
}

function simulate() {
  var timeFirst = 000;

  console.log("Start simulating ...");

  setTimeout(function() {
    console.log("Init step one ...");
    stepOneInit(function(item) {
      console.log("Init step one ...");
      stepOne(item);
    });
  }, timeFirst);

  function stepOneInit(callback) {
    item = new DB.Item({
      'name': 'gold',
      'type': 'ore',
      'cost': 100,
      'weight': 10,
      'isAuction': false
    });
    return callback(item);
  }

  function stepOne(item) {
    console.log(item);
    console.log("Item saved.");
    console.log("Pushing item to itemlist ...");
    DB.User.find(DB.User.me,{depth:2}).singleResult(function(user) {
      user.items.itemlist
        .push(item);
      DB.User.me.save({depth:2});
    });
  }

  resize();
}
