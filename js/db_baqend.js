/* --- VARIABLES --- */
var myItemsTodo = null, myAuctionsTodo = null, myBidsTodo = null;
var realtime = false;
var droppedItem = null;
var timestamp;
var auctionClassNames = [];
var timeIntervalID;
var auctionTimeDurations = [];
var eventArrived = 0;
var initialize = true;
var isResizing = false;

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
                    createBidList();
                    setTimeout(function() {
                      return callback(sk);
                    }, 0);
                  });
                });
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

// function testWebsocketConnection() {
//   // var ws = new WebSocket('ws://app-starter.events.baqend.com/v1/events'); // also ws:// can be used
//   var ws = new WebSocket('ws://misty-shape-74.events.baqend.com/v1/events');
//   ws.onopen = function() { console.log('Websocket opened') };
//   ws.onclose = function() { console.log('Websocket closed') };
//   //expect opened to be logged but closed is called immediately
// }

function initUser(username, callback) {
  // user object
  var user = new DB.User({
    'username': username,
    'securitykey': (CryptoJS.SHA256(username)).toString(CryptoJS.enc.Base64),
    'bankbalance': 0.0,
    'bids': 0
  });

  return callback(user, user.securitykey);
}

// Initialize all important VARIABLES
function init(callback) {

  getBidsTodo(function() {});
  console.log("Start Init ...");
  getItemsTodo(function() {
    console.log(2);
    getAuctionsTodo(function() {
      console.log("Init finished.");
      return callback();
    });
  });
}

function getDataForInitload() {
    lookAfterExpiredBids(function(bidlist) {
      lookAfterExpiredAuctions(function(auctionlist) {
        loadAuctionItems(auctionlist);
        loadBidItems(bidlist);
        loadItems(myItemsTodo.itemlist);

        DB.Auction.find()
        .ascending('name')
        .resultList(function(auctionItems) {
          loadSearchContent(auctionItems, null);
        });
      });
    });
}

// Get ID of user items todo
function getItemsTodo(callback) {
  DB.Items.find()
  .equal('user.username', DB.User.me.username)
  .singleResult(function(itemsTodo) {
    myItemsTodo = itemsTodo;
    console.log(1);
    return callback();
  });
}

function getAuctionsTodo(callback) {
  DB.Auctions.find()
  .equal('user.username', DB.User.me.username)
  .singleResult(function(auctionsTodo) {
    myAuctionsTodo = auctionsTodo;
    console.log(3);
    return callback();
  });
}

function getBidsTodo(callback) {
  DB.Bids.find()
         .equal('user.username', DB.User.me.username)
         .singleResult(function(bidsTodo) {
           myBidsTodo = bidsTodo;
           return callback();
         });
}

function createItemlist() {
  // items object for each individual user
  new DB.Items(
    {
      'itemlist': new DB.Map(),
      'user': { 'username': DB.User.me.username },
    }
  ).save();
}

function createAuctionList() {
  new DB.Auctions(
    {
      'user': { "username": DB.User.me.username },
      'auctionlist': new DB.List()
    }
  ).save();
}

function createBidList() {
  new DB.Bids(
    {
      'user': { "username": DB.User.me.username },
      'bidlist': new DB.Map()
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
    subscribeToBids();

    function subscribeToItems() {
      var query = DB.Items.find()
                          .equal('user.username', DB.User.me.username);
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
                             .equal('user.username', DB.User.me.username);
      var stream = query.eventStream({initial:true});
      var subscriptionUserAuctions = stream.subscribe(function(auctionsTodo) {
        updateAuctionItems(auctionsTodo.data);
      }, function(err) {
        console.log(err);
      });
      subList.push(subscriptionUserAuctions);
    }

    function subscribeToAuctions() {
      var query = DB.Auction.find({refresh:true})
                            .ascending('name');
      var stream = query.eventStream({initial:false});
      var subscriptionAuctions = stream.subscribe(function(auctionTodo) {
        updateSearchContent(auctionTodo);
      }, function(err) {
        console.log(err);
      });
      subList.push(subscriptionAuctions);
    }

    // This is for initializing the auction items, if realtime checkbox is checked for the first time.
    function subscribeToAuctionsInit() {
      var query = DB.Auction.find()
                            .ascending('user.username');
      var stream = query.resultStream();
      var subscriptionAuctionsInit = stream.subscribe(function(auctionTodos) {
        if(initialize == false) {}
        else realtimeInitSearchContent(auctionTodos);
      }, function(err) {
        console.log(err);
      });
      subList.push(subscriptionAuctionsInit);
    }

    function subscribeToBids() {
      var query = DB.Bids.find()
                         .equal('user.username', DB.User.me.username);
      var stream = query.eventStream({initial:true});
      var subscriptionBids = stream.subscribe(function(bidsTodo) {
        updateBidItems(bidsTodo);
      }, function(err) {
        console.log(err);
      });
      subList.push(subscriptionBids);
    }

    return callback(subList);
  }
}

// Create and Push the given item
function addItem(item, callback) {
  item.insert().then(function(savedItem) {
    if(myItemsTodo.itemlist.has(savedItem.name)) {
      var newArr = myItemsTodo.itemlist.get(savedItem.name);
      newArr.push(savedItem.id);
      myItemsTodo.partialUpdate()
           .put("itemlist", savedItem.name, newArr)
           .execute().then(function() {
             return callback();
           });
    } else {
      var arr = [savedItem.id];
      myItemsTodo.partialUpdate()
           .put("itemlist", savedItem.name, arr)
           .execute().then(function() {
             return callback();
           });
    }
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
    newArr = myItemsTodo.itemlist.get(itemName);
    if(typeof newArr != 'undefined') {
      newArr.pop();
      myItemsTodo.partialUpdate()
      .put("itemlist", itemName, newArr)
      .execute().then(function() {
        return callback();
      });
    } else console.log("No item named '" + itemName + "' in itemlist - Itemlist not poppable.");
}

function updateItemlist(expiredAuctions, callback) {
  var map = myItemsTodo.itemlist;
  var newArr = [];

  expiredAuctions.forEach(function(val) {
    if(map.has(val.name)) {
      var newArr = map.get(val.name).concat(val.itemlist);
      map.set(val.name, newArr);
    } else {
      map.set(val.name, val.itemlist);
    }
  });
  myItemsTodo.itemlist = map;
  myItemsTodo.save().then(function() { return callback(); });
}

function createAuction(startingPrice, buyoutPrice, auctionTime) {
  var hours = auctionTime.split(":")[0];
  var minutes = auctionTime.split(":")[1];
  var startingPrice = parseFloat(startingPrice);
  var buyoutPrice = parseFloat(buyoutPrice);
  if(isNaN(buyoutPrice)) buyoutPrice = 0;
  if(droppedItem != null) {
    if(startingPrice > 0) {
      if((buyoutPrice >= 0 && buyoutPrice > startingPrice) || buyoutPrice == 0) {
        // Data
        var startDate = moment().toDate();
        var endDate = moment().toDate();
        var timezoneOffset = startDate.getTimezoneOffset();
        var amount = 1;
        var puffer = [];
        var increaseFactor = 10; // in percent
        endDate.setHours(startDate.getHours()+parseInt(hours));
        endDate.setMinutes(startDate.getMinutes()+parseInt(minutes));

        // Process
        var itemlist = myItemsTodo.itemlist.get(droppedItem);
        if(itemlist.length === 0) {
          createAuctionMessage("Du hast keine Items.", false);
          resetDrop();
          return -1;
        }

        for(var i=0; i<amount; i++)
          puffer.push(itemlist.pop());

        myItemsTodo.partialUpdate()
                   .put("itemlist", droppedItem, itemlist)
                   .execute();

        new DB.Auction({
          'name': droppedItem,
          'user': { 'username': DB.User.me.username },
          'itemlist': puffer,
          'time': new DB.Activity({ 'start': startDate, 'end': endDate, 'timezoneOffset': timezoneOffset }),
          'amount': amount,
          'startingprice': startingPrice.toFixed(2),
          'price': startingPrice.toFixed(2),
          'buyoutprice': buyoutPrice.toFixed(2),
          'factor': { 'startingprice': startingPrice, 'increase': increaseFactor}
        }).insert().then(function(insertedAuction) {
          myAuctionsTodo.auctionlist.push(insertedAuction);
          myAuctionsTodo.save(function() {
            createAuctionMessage("Auktion erstellt!", true);
            resetDrop(true);
          });
        });
      } else createAuctionMessage("Kauf ist nicht größer als Gebot.", false);
    } else {
      createAuctionMessage("Startpreis muss größer 0 sein.", false);
      return -1;
    }
  } else {
    createAuctionMessage("Auktionsgegenstand fehlt.", false);
    return -1;
  }
}

function lookAfterExpiredAuctions(callback) {
  var auctionlist = myAuctionsTodo.auctionlist;
  if(auctionlist.length != 0) {
    var nonExpiredAuctions = [];
    var expiredAuctions = [];
    auctionlist.forEach(function(auction) {
      var diff = getRemainingTime(auction);

      if(diff.asSeconds() <= 1) {
        if(auction.bidder == null) expiredAuctions.push(auction);
        else newBidAlert("Folgender Gegenstand wurde für " + (auction.price).toFixed(2) + " € verkauft: " + auction.name);
        auction.delete();
      }
      else {
        nonExpiredAuctions.push(auction);
      }
    });
    myAuctionsTodo.auctionlist = nonExpiredAuctions;
    myAuctionsTodo.save().then(function() {
      updateItemlist(expiredAuctions, function() {
        auctionExpiredAlert(expiredAuctions, function() {});
        return callback(myAuctionsTodo);
      });
    });
  } else return callback(myAuctionsTodo);
}

async function lookAfterExpiredBids(callback) {
    var bidlist = myBidsTodo.bidlist;
    if(bidlist.size != 0) {
    var expiredBids = [];
    var noneExpiredBids = new Map();
    bidlist.forEach(function(bidVal, bidKey) {
      if(getRemainingTime(bidVal).asSeconds() <= 1) {
        expiredBids.push(bidVal);
      } else noneExpiredBids.set(bidKey, bidVal);
    });
    if(expiredBids.length != 0) {
      myBidsTodo.bidlist = noneExpiredBids;
      myBidsTodo.save().then(function() {
        updateItemlist(expiredBids, function() {
          bidExpiredAlert(expiredBids, function() {
          });
          return callback(bidlist);
        });
      });
    } else return callback(bidlist);
  } else return callback(bidlist);
}

function bidThisAuction(auctionID) {
  DB.Auction.load("/db/Auction/" + auctionID).then(function(auctionTodo) {
    if(auctionTodo.user.username != DB.User.me.username) {
      if(auctionTodo.bidder != null) {
        deleteBidder(auctionTodo.bidder, auctionTodo.key);
        if(auctionTodo.bidder.username == DB.User.me.username) {
          return -1;
        }
      }
      auctionTodo.bidder = { "username": DB.User.me.username };
      var price = auctionTodo.startingprice;
      auctionTodo.price = price;
      var newStartingPrice = auctionTodo.startingprice + auctionTodo.factor.startingprice/100 * auctionTodo.factor.increase;
      if(newStartingPrice >= auctionTodo.buyoutprice && auctionTodo.buyoutprice != 0) buyThisAuction(auctionTodo.key);
      else auctionTodo.startingprice = newStartingPrice.toFixed(2);
      auctionTodo.save().then(function(savedAuctionTodo) {
        var obj = {
          "name": auctionTodo.name,
          "itemlist": auctionTodo.itemlist,
          "time": auctionTodo.time,
          "price": price
        };
        myBidsTodo.bidlist.set(auctionTodo.key, obj);
        myBidsTodo.save();
      });
    }
  });
}

function deleteBidder(bidder, auctionKey) {
  DB.Bids.find()
          .equal("user.username", bidder.username)
          .singleResult(function(bidsTodo) {
            var bidlist = bidsTodo.bidlist;
            bidlist.delete(auctionKey);
            bidsTodo.save();
          });
}

function browseAfterAuctions() {}

function buyThisAuction(auctionID) {
  DB.Auction.load("/db/Auction/" + auctionID).then(function(auctionTodo) {
    if(auctionTodo.buyoutprice > 0) {
      updateItemlist([auctionTodo], function() {
        auctionTodo.buyed = true;
        if(auctionTodo.bidder != null) {
          deleteBidder(auctionTodo.bidder, auctionTodo.key);
          auctionTodo.bidder = null;
        }
        auctionTodo.save().then(function() {
          removeAuctionFromUserAuctionlist(auctionTodo.user.username, auctionTodo);
        });
      });
    }
  });
}

function removeAuctionFromUserAuctionlist(username, auctionTodo) {
  DB.Auctions.find()
             .equal("user.username", username)
             .singleResult(function(auctionsTodo) {
               var auctionlist = auctionsTodo.auctionlist;
               var index = auctionlist.indexOf(auctionTodo);
               auctionlist.splice(index, 1);
               auctionsTodo.save().then(function() {
                 buyThisAuctionMessage(auctionTodo, function() {
                   auctionTodo.delete();
                 });
               });
             });
}






function simulate() {
  var firstPause = 4000;
  var secondPause = 7000;
  var thirdPause = 3000;

  var item1 = new DB.Item({
    'name': 'gold',
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
