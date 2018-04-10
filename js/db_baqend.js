/* --- VARIABLES --- */
var itemsID = null, auctionsID = null;
var realtime = false;
var droppedItem = null;
var timestamp;
var auctionClassNames = [];
var timeIntervalID;
var auctionTimeDurations = [];

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
                DB.Role.find().equal('name', 'loggedIn').singleResult(function(role) {
                  DB.User.me.acl.allowReadAccess(role)
                  DB.User.me.save();
                });

                registermessage(function() {
                  createItemlist();
                  createAuctionList();
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

// function testWebsocketConnection() {
//   // var ws = new WebSocket('ws://app-starter.events.baqend.com/v1/events'); // also ws:// can be used
//   var ws = new WebSocket('ws://misty-shape-74.events.baqend.com/v1/events');
//   ws.onopen = function() { console.log('Websocket opened') };
//   ws.onclose = function() { console.log('Websocket closed') };
//   //expect opened to be logged but closed is called immediately
// }

function initUser(username, callback) {
  console.log("Initialize User ...");
  // user object
  var user = new DB.User({
    'username': username,
    'securitykey': (CryptoJS.SHA256(username)).toString(CryptoJS.enc.Base64),
    'bankbalance': 0.0
  });

  return callback(user, user.securitykey);
}

// Initialize all important VARIABLES
function init(callback) {

  console.log("Start Init ...");
  getItemsTodoID(function() {
    console.log(2);
    getAuctionsID(function() {
      console.log("Init finished.");
      return callback();
    });
  });
}

function getDataForInitload() {
  DB.Auctions.load(auctionsID, {depth: true}).then(function(auctionsTodo) {
    lookAfterExpiredAuctions(auctionsTodo, function(auctionlist) {
      loadAuctionItems(auctionlist);

      DB.Items.load(itemsID, {depth: true}).then(function(loadedItems) {
        loadItems(loadedItems.itemlist);
      });

      DB.Auction.find()
      .ascending('name')
      .resultList({depth: true}, function(auctionItems) {
        loadSearchContent(auctionItems, null);
      });
    });
  });
}

// Get ID of user items todo
function getItemsTodoID(callback) {
  DB.Items.find()
  .equal('user', DB.User.me)
  .singleResult(function(itemsTodo) {
    itemsID = itemsTodo.id;
    console.log(1);
    return callback();
  });
}

function getAuctionsID(callback) {
  DB.Auctions.find()
  .equal('user', DB.User.me)
  .singleResult(function(auctionsTodo) {
    auctionsID = auctionsTodo.id;
    console.log(3);
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
  ).save();
}

function createAuctionList() {
  new DB.Auctions(
    {
      'user': DB.User.me,
      'auctionlist': []
    }
  ).save();
}

function subscribeRealtime(sk, callback) {
  var subList = [];
  if(DB.User.me.securitykey == sk) {
    // testWebsocketConnection();
    subscribeToItems();
    subscribeToUserAuctions();
    subscribeToAuctions();
    subscribeToAuctionsInit();

    function subscribeToItems() {
      var query = DB.Items.find({depth:true})
                          .equal('user', DB.User.me);
      var stream = query.eventStream({initial:true});
      var subscriptionItems = stream.subscribe(function(itemMap) {
        updateItems(itemMap);
      }, function(err) {
        console.log(err);
      });
      subList.push(subscriptionItems);
    }

    // loadAuctionItems
    function subscribeToUserAuctions() {
      var query = DB.Auctions.find({depth:true})
                             .equal('user', DB.User.me);
      var stream = query.eventStream({initial:true});
      var subscriptionUserAuctions = stream.subscribe(function(auctionsTodo) {
        updateAuctionItems(auctionsTodo.data);
      }, function(err) {
        console.log(err);
      });
      subList.push(subscriptionUserAuctions);
    }

    function subscribeToAuctions() {
      var query = DB.Auction.find()
                            .ascending('name');
      var stream = query.eventStream({initial:false});
      var subscriptionAuctions = stream.subscribe(function(auctionTodo) {
        console.log(auctionTodo);
        updateSearchContent(auctionTodo);
      }, function(err) {
        console.log(err);
      });
      subList.push(subscriptionAuctions);
    }

    // This is for initializing the auction items, if realtime checkbox is checked for the first time.
    function subscribeToAuctionsInit() {
      var query = DB.Auction.find()
                            .ascending('name');
      var stream = query.resultStream();
      var initialized = false;
      var subscriptionAuctionsInit = stream.subscribe(function(auctionTodos) {
        if(initialized) {
        } else {
          realtimeInitSearchContent(auctionTodos);
          initialized = true;
        }
      }, function(err) {
        console.log(err);
      });
      subList.push(subscriptionAuctionsInit);
    }

    return callback(subList);
  }
}

function pushItemlist(givenItemlist, callback) {
  DB.Items.load(itemsID).then(function(itemsTodo) {
    var newArr = itemsTodo.itemlist.concat(givenItemlist);
    items.partialUpdate
         .set("itemlist", newArr)
         .execute().then(function() {
           console.log("Concat array.");
           return callback();
         });
  });
}

// Create and Push the given item
function addItem(item, callback) {
  item.insert().then(function(savedItem) {
    DB.Items.load(itemsID, {refresh:true}).then(function(items) {
      if(items.itemlist.has(savedItem.name)) {
        var newArr = items.itemlist.get(savedItem.name);
        newArr.push(savedItem.id);
        items.partialUpdate()
             .put("itemlist", savedItem.name, newArr)
             .execute().then(function() {
               return callback();
             });
      } else {
        var arr = [savedItem.id];
        items.partialUpdate()
             .put("itemlist", savedItem.name, arr)
             .execute().then(function() {
               return callback();
             });
      }
    }, function(err) {
      console.log("ERROR:\n"+err+"\nCan't insert item.")
    });
  });
}

function deleteItem(id, callback) {
  // Remove and delete the given item
  DB.Item.load(id).then(function(item) {
    if(item != null) {
      item.delete().then(function() {
        DB.Items.load(itemsID, {depth:1}).then(function(itemlist) {
          itemlist.partialUpdate()
          .remove("itemlist", id)
          .execute().then(function() {
            return callback();
          });
        });
      });
    } else console.log("Object is null - Can't delete item.");
  });
}

function popItem(itemName, callback) {
  // Pop and item
  DB.Items.load(itemsID, {refresh:true}).then(function(items) {
    newArr = items.itemlist.get(itemName);
    if(typeof newArr != 'undefined') {
      newArr.pop();
      items.partialUpdate()
      .put("itemlist", itemName, newArr)
      .execute().then(function() {
        return callback();
      });
    } else console.log("No item named '" + itemName + "' in itemlist - Itemlist not poppable.");
  });
}

function createAuction(startingPrice, buyoutPrice, auctionTime) {
  var hours = auctionTime.split(":")[0];
  var minutes = auctionTime.split(":")[1];

  if(droppedItem != null) {
    if(startingPrice > 0) {
      if((buyoutPrice >= 0 && buyoutPrice > startingPrice) || buyoutPrice == "") {
        // console.log("Ok, let's create the auction!");
        // Data
        var startDate = moment().toDate();
        var endDate = moment().toDate();
        var timezoneOffset = startDate.getTimezoneOffset();
        var amount = 1;
        var puffer = [];
        endDate.setHours(startDate.getHours()+parseInt(hours));
        endDate.setMinutes(startDate.getMinutes()+parseInt(minutes));

        // Process
        DB.Items.load(itemsID).then(function(items) {
          var itemlist = items.itemlist.get(droppedItem);
          if(itemlist.length === 0) {
            createAuctionMessage("Du hast keine Items.", false);
            resetDrop();
            return -1;
          }

          for(var i=0; i<amount; i++)
            puffer.push(itemlist.pop());


          items.partialUpdate()
               .put("itemlist", droppedItem, itemlist)
               .execute();

          new DB.Auction({
            'name': droppedItem,
            'user': DB.User.me,
            'itemlist': puffer,
            'time': new DB.Activity({ 'start': startDate, 'end': endDate, 'timezoneOffset': timezoneOffset }),
            'amount': amount,
            'startingprice': startingPrice,
            'buyoutprice': buyoutPrice
          }).insert().then(function(insertedAuction) {
            DB.Auctions.load(auctionsID, {refresh:true}).then(function(auctionsTodo) {
              var newArr = auctionsTodo.auctionlist;
              newArr.push(insertedAuction);
              auctionsTodo.auctionlist = newArr;
              auctionsTodo.save({depth:true}, function() {
                createAuctionMessage("Auktion erstellt!", true);
                resetDrop(true);
              });
            });
          });
        });
      } else createAuctionMessage("Kauf ist nicht größer als Gebot.", false);
    } else {
      if(startingPrice == "") createAuctionMessage("Startpreis fehlt.", false);
      else if(startingPrice < 1) createAuctionMessage("Startpreis muss größer 0 sein.", false);
      return -1;
    }
  } else {
    createAuctionMessage("Auktionsgegenstand fehlt.", false);
    return -1;
  }
}

function lookAfterExpiredAuctions(auctionsTodo, callback) {
  if(auctionsTodo == null) {
    DB.Auctions.load(auctionsID).then(function(loadedAuctionsTodo) {
      auctionsTodo = null;
      auctionsTodo = loadedAuctionsTodo;
      scan();
    });
  } else scan();


  function scan() {
    var auctionlist = auctionsTodo.auctionlist;
    var nonExpiredAuctions = [];
    var expiredAuctions = [];
    auctionlist.forEach(function(auction) {
      /* TIME */
      var auctionStart = moment(auction.time.start);
      var auctionEnd = moment(auction.time.end);
      // This is for checking the remaining time of all items
      var auctionTimezoneOffset = auction.time.timezoneOffset;
      var diff = getRemainingTime(auctionEnd, auctionTimezoneOffset);

      if(diff.asSeconds() < 1) {
        expiredAuctions.push(auction);
        auction.delete();
      } else {
        nonExpiredAuctions.push(auction);
      }
    });
    auctionsTodo.auctionlist = nonExpiredAuctions;
    auctionsTodo.save().then(function() {
      if(expiredAuctions.length != 0) {
        if(expiredAuctions.length == 1) auctionExpiredAlert(expiredAuctions.length + " Auktion ist abgelaufen und wurde deiner Itemliste wieder hinzugefügt.")
        else auctionExpiredAlert(expiredAuctions.length + " Auktionen sind abgelaufen und wurden deiner Itemliste wieder hinzugefügt.")
      }
      DB.Items.load(itemsID, {depth:true}).then(function(loadedItemsTodo) {
        var map = loadedItemsTodo.itemlist;
        var newArr = [];
        expiredAuctions.forEach(function(val, key) {
          var newArr = map.get(val.name).concat(val.itemlist);
          map.set(val.name, newArr);
        });
        loadedItemsTodo.auctionlist = map;
        loadedItemsTodo.save({depth: true}).then(function() { return callback(auctionsTodo); });
      });
    });
  }
}

function browseAfterAuctions() {}

function bidThisAuction(auctionID) {
  var user = DB.User.me;
  DB.Auction.load("/db/Auction/" + auctionID).then(function(auctionTodo) {
    if(auctionTodo.user != user) {
      auctionTodo.bidder = user;
      DB.User.me.bids++;
      DB.User.me.save();

      auctionTodo.save().then(function() {
        bidThisAuctionMessage(auctionTodo.key);
      });
    }
  });
  // console.log(auctionID);
  // if(user == DB.User.me) return -1;
}

function buyThisAuction(auctionID) {
  var user = DB.User.me;
  console.log(auctionID);
  if(user == DB.User.me) return -1;
}






function simulate() {
  var firstPause = 4000;
  var secondPause = 7000;
  var thirdPause = 3000;

  var item1 = new DB.Item({
    'name': 'iron',
    'type': 'ore',
    'weight': 10
  });

  console.log("Start simulating!");
  // setInterval(loop,1000);
  // Start callback hell ...
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
    console.log("loop");
  }
  function stepOne(item) {
    addItem(item, function() {

    });
  }
  function stepTwo() {
    popItem('gold', function() {

    });
  }
  function stepThree() {

  }
}
