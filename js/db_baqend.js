/* --- VARIABLES --- */
var itemsID = null, auctionsID = null;
var realtime = "off";
var droppedItem = null;
var timestamp;

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
    'securitykey': (CryptoJS.SHA256(username)).toString(CryptoJS.enc.Base64),
    'bankbalance': 0.0
  });

  return callback(user, user.securitykey);
}

// Initialize all important VARIABLES
function init(callback) {
  console.log("Start Init ...");
  setTimestamp();
  getItemsTodoID(function() {
    console.log(2);
    getAuctionsID(function() {
      console.log("Init finished.");
      return callback();
    });
  });
}

function getDataForInitload() {
  DB.Items.load(itemsID, {depth: true}).then(function(loadedItems) {
    loadItems(loadedItems.itemlist);
  });
  DB.Auctions.load(auctionsID, {depth: true}).then(function(auctionObject) {
    loadAuctionItems(auctionObject.auctionlist);
  });
  DB.Auctions.find().resultList(function(auctionItems) {
    loadSearchResult(auctionItems);
  });
}

function setTimestamp() {
  timestamp = moment().toDate();
  setInterval(function() {
    timestamp = moment().toDate();
  }, 60000);
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
    testWebsocketConnection();
    subscribeToItems();
    subscribeToUserAuctions();
    subscribeToAuctions();

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
      var subscriptionUserAuctions = stream.subscribe(function(auctionList) {
        updateAuctionItems(auctionList.data.auctionlist);
      }, function(err) {
        console.log(err);
      });
      subList.push(subscriptionUserAuctions);
    }

    function subscribeToAuctions() {
      var query = DB.Auctions.find({depth:true});
      var stream = query.eventStream({initial:true});
      var subscriptionAuctions = stream.subscribe(function(auctionList) {
        updateSearchContent(auctionList);
      }, function(err) {
        console.log(err);
      });
      subList.push(subscriptionAuctions);
    }

    return callback(subList);
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
    'isAuction': false
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
    console.log("sos");
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
      if(buyoutPrice >= 0 || buyoutPrice === "") {
        console.log("Ok, let's create the auction!");
        // Data
        var startDate = moment().toDate();
        var endDate = moment().toDate();
        var timezoneOffset = startDate.getTimezoneOffset();
        var amount = 1;
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

          var puffer = new DB.List();
          for(var i=0; i<amount; i++)
            puffer.push(itemlist.pop());

            console.log(puffer);
          items.partialUpdate()
               .put("itemlist", droppedItem, itemlist)
               .execute();
          var auctionObject = {
            'name': droppedItem,
            'itemlist': puffer,
            'time': new DB.Activity({ 'start': startDate, 'end': endDate, 'timezoneOffset': timezoneOffset })
          }
          var auction = new DB.Auction(auctionObject);

          auction.insert().then(function() {
            DB.Auctions.load(auctionsID, {refresh:true}).then(function(auctionsTodo) {
              auctionsTodo.partialUpdate()
              .push("auctionlist", auction)
              .execute().then(function() {
                createAuctionMessage("Auktion erstellt!", true);
                if(itemlist.length == 0) resetDrop();
              });
            });
          });
        });
      }
    } else {
      if(startingPrice == "") createAuctionMessage("Bitte gebe einen Startpreis an.", false);
      else if(startingPrice < 1) createAuctionMessage("Startpreis muss größer 0 sein.", false);
      return -1;
    }
  } else {
    createAuctionMessage("Auktionsgegenstand fehlt.", false);
    return -1;
  }
}

function searchRealtime(obj) {
  var textInput = obj.value;
  var auction
  console.log(textInput);

  DB.Auctions.load().then(function() {
    console.log();
  });
}

function browseAfterAuctions() {
  searchInput = $('#search_field').val();
  if(searchInput.length == 0) {
    DB.Auctions.find().resultList(function(auctionlist) {
      loadSearchResult(auctionlist);
    });
  } else if(searchInput.length > 0) {
    var filter = "auctionlist." + searchInput;
    DB.Auctions.find({depth:true})
               .where({ "auctionlist.gold": { $exists: true, $ne: null } })
               .resultList(function(auctions) {
                 console.log(auctions);
               })
  }
}
