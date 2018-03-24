/* --- VARIABLES --- */
var itemsID = null;
var realtime = "off";

$(document).ready(function() {
  DB.connect('misty-shape-74', false).then(function() {
    console.log("Connected");
  });
})

//Wait for connection
DB.ready().then(function() {
  if (DB.User.me) {
    //do additional things if user is logged in
    console.log('Willkommen ' + DB.User.me.username + '!'); //the username of the user
    transferToLogin(DB.User.me.securitykey);
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
                  createItemlist();
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


function testWebsocketConnection() {
  // var ws = new WebSocket('ws://app-starter.events.baqend.com/v1/events'); // also ws:// can be used
  var ws = new WebSocket('ws://misty-shape-74.events.baqend.com/v1/events');
  ws.onopen = function() { console.log('Websocket opened') };
  ws.onclose = function() { console.log('Websocket closed') };
  //expect opened to be logged but closed is called immediately
}

function initUser(username, callback) {
  console.log("Initialize User ...");
  // user object
  var user = new DB.User({
    'username': username,
    'securitykey': (CryptoJS.SHA256(username)).toString(CryptoJS.enc.Base64)
  });

  return callback(user, user.securitykey);
}

// Initialize all important VARIABLES
function init(callback) {
  console.log("Start Init ...");
  getItemsTodoID(function() {
    console.log(2);
    console.log("Init finished.");
    return callback();
  });
}

// Get ID of user items todo
function getItemsTodoID(callback) {
  DB.Items.find()
  .equal('user', DB.User.me)
  .singleResult(function(items) {
    itemsID = items.id;
    console.log(1);
    return callback();
  });
}

function createItemlist() {
  // items object for each individual user
  new DB.Items(
    {
      'itemlist': new DB.Map(),
      'user': DB.User.me
    }
  ).save({depth:1});
}

function subscribeRealtime(sk, callback) {
  if(DB.User.me.securitykey == sk) {
    testWebsocketConnection();

    var useritems = DB.User.me.items;
    var query = DB.Items.find()
                        .equal('user', DB.User.me);
    var stream = query.eventStream({initial:true});
    var subscriptionFirst = stream.subscribe(function(itemMap) {
      updateItems(itemMap);
    }, function() {
      console.log(err);
    });


    return callback([subscriptionFirst]);
  }
}

function simulate() {
  var firstPause = 4000;
  var secondPause = 7000;
  var thirdPause = 3000;

  var item1 = new DB.Item({
    'name': 'gold',
    'type': 'ore',
    'cost': 2,
    'weight': 10,
    'isAuction': false,
    'uid': DB.User.me.id
  });

  console.log("Start simulating!");
  // setInterval(loop,1000);
  console.log("Step 1: Pushing item in " + firstPause/1000 + " seconds ...");
  setTimeout(function() {
    stepOne(item1);
    console.log("Step 2: Pop item in " + secondPause/1000 + " seconds ...");
    setTimeout(function() {
      stepTwo();
      console.log("Step 3: " + thirdPause/1000 + " seconds ...");
      setTimeout(function() {
        stepThree();
      }, thirdPause);
    }, secondPause);
  }, firstPause);


  function loop() {
    console.log("sos");
  }
  function stepOne(item) {
    addItem(item);
  }
  function stepTwo() {
    // deleteItem("/db/Item/4591344b-0619-4f02-902f-182216a161a6");
    popItem('gold');
  }
  function stepThree() {

  }
}

// Create and Push the given item
function addItem(item) {
  item.insert().then(function(savedItem) {
    DB.Items.load(itemsID, {refresh:true}).then(function(items) {
      if(items.itemlist.has(savedItem.name)) {
        var newArr = items.itemlist.get(savedItem.name);
        newArr.push(savedItem.id);
        items.partialUpdate()
             .put("itemlist", savedItem.name, newArr)
             .execute();
      } else {
        var arr = [savedItem.id];
        items.partialUpdate()
             .put("itemlist", savedItem.name, arr)
             .execute();
      }
    }, function(err) {
      console.log("ERROR:\n"+err+"\nCan't insert item.")
    });
  });
}

function deleteItem(id) {
  // Remove and delete the given item
  DB.Item.load(id).then(function(item) {
    if(item != null) {
      item.delete().then(function() {
        DB.Items.load(itemsID, {depth:1}).then(function(itemlist) {
          itemlist.partialUpdate()
          .remove("itemlist", id)
          .execute();
        });
      });
    } else console.log("Object is null - Can't delete item.");
  });
}

function popItem(itemName) {
  // Pop and item
  DB.Items.load(itemsID, {refresh:true}).then(function(items) {
    var newArr = items.itemlist.get(itemName);
    newArr.pop();
    items.partialUpdate()
         .put("itemlist", itemName, newArr)
         .execute();
  });
}

function addAuction(e) {
  console.log(e);
}
