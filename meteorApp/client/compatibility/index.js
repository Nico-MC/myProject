// Load mit Vorsicht genießen, da asynchron.
// Für synchrones Laden: Ajax
function transferToLogin() {
  var login_template = Template.login_content;
  var insert_div = document.getElementById('insert_div');
  login_template.onRendered(function() {
    // init(function() {
      loadLogin(); //race conditions? https://stackoverflow.com/questions/8611145/race-conditions-with-javascript-event-handling
    // });
  });
  Blaze.render(login_template, insert_div);

  function loadLogin() {
    setTimeout(function() {
      getDataForInitload();
    }, 300);

    // load user profile_option_div
    $('.profile_option_div .username').text(Meteor.user().username);
    // $('.profile_option_div .bankbalance').text(DB.User.me.bankbalance);
    // $('.profile_option_div .bids').text(DB.User.me.bids);

    // query-ui slider
    var slider_hours = $("#auction_duration_slider_hours").slider();
    console.log(slider_hours);
    var slider_minutes = $("#auction_duration_slider_minutes").slider();
    var initSlider = function() {
      var options_hours = {
        min: 0,
        max: 48,
        value: 0,
        slide: function(e, ui) {
          if(ui.value == 0) {
            slider_minutes.slider("option", "min", 1);
          }
          else {
            slider_minutes.slider("option", "min", 0);
          }
          if(ui.value == 48) {
            slider_minutes.slider("disable");
            slider_minutes.slider("option", "max", 0);
          } else {
            slider_minutes.slider("enable");
            slider_minutes.slider("option", "max", 59);
          }

          var hours = ui.value;
          var minutes = slider_minutes.slider("value");
          $('#auctionDuration').val(hours + ":" + minutes);
        }
      }
      slider_hours.slider('option', options_hours);
      var options_minutes = {
        min: 1,
        max: 59,
        value: 0,
        slide: function(e, ui) {
          var hours = slider_hours.slider("value");
          var minutes = ui.value;
          $('#auctionDuration').val(hours + ":" + minutes);
        }
      }
      slider_minutes.slider('option', options_minutes);

      $('#auctionDuration').val("0:1");
    }
    initSlider();

    $('.inventar_item').click(function(e) {
      var target = e.target;
      console.log(target);
    });

    $('#search').submit(function(e) {
      e.preventDefault();
    });

    $('#search_field').keyup(function() {
        searchRealtime();
    });

    // Clear text search_field
    $("#search_field").val("");

    var streamlist;
    $('#check_realtime').change(function() {
      if(checkRealtime() && (streamlist == null)) {
        // subscribeRealtime(sk, function(streams) {
          initialize = true;
          streamlist = streams;
          console.log("Realtime is on.");
        // });
      } else {
        streamlist.forEach(function(stream) {
          stream.unsubscribe();
        });
        streamlist = null;
        console.log("All streams unsubscribed.");
        console.log("Realtime is off.");
        clearTimeInterval(timeIntervalID)
        timeIntervalID = null;
      }
    });

    // startGame();
    $('#check_realtime').trigger("click");
  }
}

function transferToRegister() {
  var register_template = Template.register_content;
  var insert_div = document.getElementById('insert_div');
  register_template.onRendered(function() {
    loadRegister();
  });
  Blaze.render(register_template, insert_div);

  function loadRegister() {
    $('.register_div').fadeIn(2000);
    // Click on register-button
    $("#register").submit(function(event) {
      event.preventDefault();
      register($(this).serializeArray(), function(sk) {
        transferToLogin(sk);
      });
    });
    // Click on login-button
    $("#login").submit(function(event) {
      event.preventDefault();
      login($(this).serializeArray(), function(sk) {
        $.when( $('section .register_container').fadeOut("slow") ).done(function() {
           transferToLogin(sk);
        });
      });
    });
  }
}

function loadItems(itemlist) {
  // if itemlist is not empty:
  function render(callback) {
    itemlist.forEach(function(value, key) {
      if(value.length != 0) {
        $('.inventar_div .no_items').fadeOut('fast').promise().done(function() {
          $(this).remove();
          if($('.inventar_div').find('.inventar_item.' + key).length === 0) {
            $('<div class="inventar_item '+key+'" draggable="true" ondragstart="drag(event)"><span class="item_number strokeme">'+value.length+'</span></div>').appendTo('.inventar_div').show('slow');
          } else {
            $('.inventar_item.'+key+' .item_number').html(value.length);
          }
        });
      } else {
        $('.inventar_item.'+key).hide('slow', function() { $(this).remove(); });
      }
    });

    return callback();
  }

  render(function() {
    setTimeout(function() {
      if($('.inventar_div > .inventar_item').length === 0 && $('.inventar_div > .no_items').length === 0) {
        $('.inventar_div').html('<span class="no_items">Keine Items vorhanden.</span>');
        $('.inventar_div .no_items').fadeIn("fast");
      }
    }, 1000);
    // resizeAuto();
  });

}

function loadAuctionItems(auctions) {
  var auctions = auctions.auctionlist;
  function render(callback) {
    // if auctionlist is not empty:
    if(auctions.length != 0) {
      var auctionElements = [];
      auctions.forEach(function(auction) {
        var auctionName = auction.name;
        var itemlist = auction.itemlist;
        var auctionKey = auction.key;
        var auctionStartingPrice = parseFloat(auction.startingprice).toFixed(2);
        var auctionBuyoutPrice = parseFloat(auction.buyoutprice).toFixed(2);
        var diff = getRemainingTime(auction);

        var checkAuctionBuyoutPrice = function() {
          if(auctionBuyoutPrice == 0) return '';
          else return '<div class="buyout_price">'+auctionBuyoutPrice+' € (Sofortkauf)</div>'
        };
        var chechAuctionBidder = function() {
          if(auction.bidder != null) return '<div style="color: #007700; font-weight: 600;" class="high_bidder">'+auction.bidder.username+'</div>';
          else return '<div style="color: #7d0000" class="high_bidder">Keine Gebote</div>';
        };
        var checkAuctionPrice = function() {
          if(auction.bidder != null) return '<div class="starting_price">'+auctionStartingPrice+' €</div>';
          else return '<div class="starting_price">'+auctionStartingPrice+' €</div>'+checkAuctionBuyoutPrice();
        }

        $('.auction_div .no_items').fadeOut('fast').promise().done(function() {
          $(this).remove();
          if($('.auction_div').find('.auction_div_row#' + auctionKey).length === 0) {
            var html = '<div id="'+ auctionKey +'" style="display: none" class="auction_div_row flex"> \
                          <div class="auction_item_div category_content flex-child"> \
                            <div class="auction_item '+auctionName+'"><span class="item_number strokeme">'+itemlist.length+'</span></div> \
                          </div> \
                          <div class="auction_end_div category_content flex-child"> \
                            <div class="endtime">'+formatTime(diff, "seconds")+'</div> \
                          </div> \
                          <div class="high_bidder_div category_content flex-child"> \
                            '+chechAuctionBidder()+' \
                          </div> \
                          <div class="auction_starting_price_div category_content flex-child"> \
                            '+checkAuctionPrice()+' \
                          </div> \
                        </div>';

            $(html).appendTo('.auction_div').show('slow');
          } else {
            $('.auction_item.'+auctionName+' .item_number').html(itemlist.length);
          }
        });
        auctionElements.push(auction.key);
      });

      // This is to filter the old elements and remove them immediately
      if($('.auction_div > .auction_div_row').length != 0) {
        var loadedElements = $('.auction_div').children().toArray();

        $(loadedElements).each(function(key, val) {
          if($.inArray(val.id, auctionElements) == -1) $(val).hide('slow', function() { $(this).remove(); });
        });
      }
    } else if(auctions.length === 0 && $('.auction_div .no_items').length === 0) {
      $('.auction_div').children().hide("slow").promise().done(function() {
        $('.auction_div').html('<span class="no_items">Keine aktuellen Auktionen.</span>');
        $('.auction_div .no_items').fadeIn("fast");
      });
    }
    return callback();
  }
  setTimeout(function() {
    render(function() {
      // setTimeout(function() {
      //   resizeAuto();
      // }, 500);
    });
  }, 300);
}

function loadBidItems(bidlist, callback) {
  function render(callback) {
    // if bidlist is not empty:
    if(bidlist.size != 0) {
      var bidElements = [];
      bidlist.forEach(function(bid, key) {
        var name = bid.name;
        var price = parseFloat(bid.price).toFixed(2);
        var diff = getRemainingTime(bid);
        var itemlist = bid.itemlist;

        $('.bids_div .no_items').fadeOut('fast').promise().done(function() {
          $(this).remove();
          if($('.bids_div').find('.bid_div_row#' + key).length === 0) {
            var html = '<div id="'+ key +'" class="bid_div_row flex"> \
                          <div class="bid_item_div category_content flex-child"> \
                            <div class="bid_item '+name+'"><span class="item_number strokeme">'+itemlist.length+'</span></div> \
                          </div> \
                          <div class="bid_end_div category_content flex-child"> \
                            <div class="endtime">'+formatTime(diff, "minutes", true)+'</div> \
                          </div> \
                          <div style="color: #007700;" class="bid_status_div category_content flex-child"> \
                             Höchstbietender \
                          </div> \
                          <div class="bid_price_div category_content flex-child"> \
                            '+price+' € \
                          </div> \
                        </div>';

            $(html).appendTo('.bids_div');
          } else {
            $('.bid_item.'+name+' .item_number').html(itemlist.length);
          }
        });
        bidElements.push(key);
      });

      // This is to filter the old elements and remove them immediately
      if($('.bids_div > .bid_div_row').length != 0) {
        var loadedElements = $('.bids_div').children().toArray();

        $(loadedElements).each(function(key, val) {
          if($.inArray(val.id, bidElements) == -1) $(val).hide('slow', function() { $(this).remove(); });
        });
      }
    } else if(bidlist.size === 0 && $('.bids_div .no_items').length === 0) {
      $('.bids_div').children().hide("slow").promise().done(function() {
        $('.bids_div').html('<span class="no_items">Keine aktuellen Gebote.</span>');
        $('.bids_div .no_items').fadeIn("fast");
      });
    }
    return callback();
  }
  setTimeout(function() {
    render(function() {
      if(callback != null) return callback();
    });
  }, 300);
}

function loadSearchContent(auctions, callback) {
  auctionClassNames = [];
  var callbackCount = 0;
  function render(callback) {
    auctions.forEach(function(auction) {
      var diff = getRemainingTime(auction);

      if(diff.asSeconds() > 1) {
        var auctionName = auction.name;
        var auctionKey = auction.key;
        /* PRICE */
        var auctionUser = auction.user.username;
        var auctionStartingPrice = parseFloat(auction.startingprice).toFixed(2);
        var auctionBuyoutPrice = parseFloat(auction.buyoutprice).toFixed(2);
        var checkAuctionBuyoutPrice = function() {
          if(auctionBuyoutPrice == 0) return '';
          else return '<div class="buyout_price">'+auctionBuyoutPrice+' € (Sofortkauf)</div>'
        };
        var checkAuctionButtons = function() {
          if(auctionUser == DB.User.me.username)
            return '';
          else if(auction.bidder != null && auction.bidder.username == DB.User.me.username)
            return "<div class=your_bid>dein gebot</div>";
          else {
            if(auction.buyoutprice > 0)
              return html = '<button class="bid_auction_button" type="button" name="button" onclick="clickBidAuctionButton(this)">Bieten</button> \
                             <button class="buy_auction_button" type="button" name="button" onclick="clickBuyAuctionButton(this)">Kaufen</button>';
            else
              return html = '<button class="bid_auction_button" type="button" name="button" onclick="clickBidAuctionButton(this)">Bieten</button>';
          }
        };

        if($('.search_content_row#' + auctionKey).length == 0) {
          var html = '<div id="'+auctionKey+'" style="display: none" class="search_content_row flex"> \
                        <div class="auction_item_div category_content flex-child"> \
                          <div class="searched_item '+auctionName+'"><span class="item_number strokeme">'+auction.itemlist.length+'</span></div> \
                        </div> \
                        <div class="auction_bidder_div category_content flex-child"> \
                          <div>'+auctionUser+'</div> \
                        </div> \
                        <div class="auction_end_div category_content flex-child"> \
                          <div class="endtime">'+formatTime(diff, "minutes", true)+'</div> \
                        </div> \
                        <div class="auction_price_div category_content flex-child"> \
                          <div class="auction_price"> \
                            <div class="starting_price">'+auctionStartingPrice+' &euro;</div> \
                            '+checkAuctionBuyoutPrice()+' \
                          </div> \
                        </div> \
                        <div class="auction_buttons"> \
                          '+checkAuctionButtons()+' \
                        </div> \
                      </div>';

          $(html).appendTo('.search_content_div').show("slow", function() {
            // resizeAuto();
            auctionTimeDurations.push([$(".search_content_row#"+auctionKey), diff]);
          });
          // This is for searching after available auctions in search bar (look function: searchRealtime())
          if(auctionClassNames.indexOf(auctionName)) { auctionClassNames.push(auctionName); }
        }

        callbackCount++;
        if(callbackCount == auctions.length) callback();
      }
    });
    var endTimes = $('.endtime');
    if(realtime && timeIntervalID == null) timeIntervalID = setTimeInterval();
  }

  render(function() {
    if(callback != null) return callback();
  });
}

function updateItems(items) {
  loadItems(items.data.itemlist);
}

function updateAuctionItems(userAuctions) {
  loadAuctionItems(userAuctions);
}

function updateBidItems(bidsTodo) {
  loadBidItems(bidsTodo.data.bidlist, function() {
    setTimeout(function() {
      resizeAuto();
    }, 500);
  });
}

function updateSearchContent(auctionTodo) {
  var matchType = auctionTodo.matchType;

  if(auctionTodo.data != null) {
    if(matchType == "add") {
      var buyoutprice = auctionTodo.data.buyoutprice;
      var startingprice = auctionTodo.data.startingprice;
      var key = auctionTodo.data.key;
      var bidder = auctionTodo.data.bidder;
      loadSearchContent([auctionTodo.data], function() {
        setTimeout(function() {
          resizeAuto();
        }, 1000);
      });
    } else if(matchType == "remove") {
      var key = auctionTodo.data.key;
      $('#'+key).hide("slow", function() {
        $(this).remove();
          setTimeout(function() {
            resizeAuto();
          }, 300);
      });
    } else if(matchType == "change") {
      if(auctionTodo.data.buyed) {
        auctionBuyedAlert(auctionTodo.data);
        return -1;
      }

      var buyoutprice = auctionTodo.data.buyoutprice;
      var startingprice = auctionTodo.data.startingprice;
      var key = auctionTodo.data.key;
      var bidder = auctionTodo.data.bidder;
      if(bidder != null) {
        $('*[id^="'+key+'"] .starting_price').each(function(i, val) {
          $(this).text(parseFloat(startingprice).toFixed(2) + " €");
        });
        if(buyoutprice != 0) $(".auction_div .buyout_price").hide("slow", function() { $(this).remove() })

        $(".auction_div_row#"+key+" .high_bidder").text(bidder.username);
        $(".auction_div_row#"+key+" .high_bidder").css("color", "#007700");

        if(auctionTodo.data.user.username == DB.User.me.username) {
          var message = "Neues Gebot für folgenden Gegenstand: " + "'" + capitalizeFirstLetter(auctionTodo.data.name) + "'";
          newBidAlert(message, function() {});
        }
        bidThisAuctionMessage(auctionTodo.data);
      }
    }
  } else console.log("ERROR: Couldn't read coming event");
}

function realtimeInitSearchContent(auctions) {
  initialize = false;
  auctionTimeDurations = [];
  $('.search_content_div').children('.search_content_row').hide("slow").promise().done(function() {
    $('.search_content_div').html('');
    loadSearchContent(auctions, function() {});
  });
  setTimeout(function() {
    lookAfterExpiredBids(function(bidlist) {
      lookAfterExpiredAuctions(function() {
        // resizeAuto();
      });
    });
  }, 2000);
}

function searchRealtime() {
  var searchInput = $('#search_field').val().toLowerCase();
  var loadedElements = $('.search_content_row').toArray();
  loadedElements.forEach(function(loadedElement) {
    var className = getClassName($(loadedElement).find(".searched_item").attr("class"), 1).toLowerCase();
    if(className.indexOf(searchInput) > -1) $('.search_content_row#' + loadedElement.id).show("slow", function() { resizeAuto(); });
    else $('.search_content_row#' + loadedElement.id).hide("slow", function() { resizeAuto(); });
  });
}

function escapeID(id) {
  // return "#" + id.replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" );
}

function checkRealtime() {
  realtime = $('input[type=checkbox]#check_realtime').prop('checked');
  if(realtime) {
    return true;
  } else {
    return false;
  }
}

/* ----- DRAG AND DROP ----- */
function allowDrop(e) {
  e.preventDefault();
}

function drag(e) {
  e.dataTransfer.setData("text", getClassName(e.target.className, 1));
}

function drop(e) {
    e.preventDefault();
    resetDrop();
    var classNameToInsert = e.dataTransfer.getData("text");
    // $('.auction_item .background_overflow_div').attr('class', 'background_overflow_div');
    $('.auction_item .background_overflow_div').addClass(classNameToInsert);
    droppedItem = classNameToInsert;
    $('.auction_item_name').text(capitalizeFirstLetter(classNameToInsert));
    $('.auction_item_name_div').show("slow");

}

function resetDrop(hideItem) {
  droppedItem = null;
  var getClass = getClassName($('.auction_item .background_overflow_div').attr('class'), 1);
  $('.auction_item .background_overflow_div').removeClass(getClass);
  if(hideItem) $('.auction_item_name_div').hide("slow");
}

function getClassName(className, index) {
  return className.split(" ")[index];
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/* ----- BUTTONS ----- */
function clickAuctionButton() {
  var startingPrice = $('#startingPrice').val();
  var buyoutPrice = $('#buyOut').val();
  var auctionTime = $('#auctionDuration').val();

  createAuction(startingPrice, buyoutPrice, auctionTime);
}

function clickBidAuctionButton(element) {
  var auctionID = $(element).parents(".search_content_row").attr("id");
  bidThisAuction(auctionID);
}

function clickBuyAuctionButton(element) {
  var auctionID = $(element).parents(".search_content_row").attr("id");
  buyThisAuction(auctionID);
}

function checkBidAuthority(auctionTodo, callback) {

}
/* ---------------------- */
/* ----- TIME START ----- */
function getRemainingTime(auction) {
  /* TIME */
  var auctionStart = moment(auction.time.start);
  var auctionEnd = moment(auction.time.end);
  // This is for checking the remaining time of all items
  var auctionTimezoneOffset = auction.time.timezoneOffset;
  var now = moment().utcOffset(auctionTimezoneOffset);
  return moment.duration(auctionEnd.diff(now));
}

function formatTime(time, option, init) {
  if(option == "seconds") {
    var newTime = "";
    if(time.hours() != 0) newTime += time.hours() + ":";
      else newTime += "0:";
    if(time.minutes() != 0) newTime += time.minutes() + ":";
    if(time.seconds() != 0) newTime += time.seconds();
     else newTime += "0";
     return newTime;
   } else if(option == "minutes") {
     if(time.asSeconds() < 60) return "0:1"
     var newTime = "";
     if(time.hours() != 0) newTime += time.hours() + ":";
       else newTime += "0:";
     if(time.minutes() != 0) {
       if(init) newTime += time.minutes()+1;
       else newTime += time.minutes();
     }
    return newTime;
   }
}

function setTimeInterval() {
  return setInterval(function() {
                      updateAuctionsTime();
                    }, 1000)
}

function clearTimeInterval(id) {
  clearInterval(id);
}

var runningTime = 0;
function updateAuctionsTime() {
  runningTime++;
  auctionTimeDurations.forEach(function(val, index) {
    var insertTo = $(val[0]).attr("id");
    var endTime = val[1].subtract(1, "seconds");

    if(endTime.asSeconds() < 1) {
      auctionTimeDurations.splice(index, 1);
      lookAfterExpiredBids(function(bidlist) {
        lookAfterExpiredAuctions(function() {});
      });
      $("div#"+insertTo).hide("slow", function() {
        $(this).css("display", "none");
      });
      return -1;
    }
    if(endTime.seconds()%60 == 0) {
      $(".search_content_row#"+insertTo + " .endtime").text(formatTime(endTime, "minutes"));
      $(".bid_div_row#"+insertTo + " .endtime").text(formatTime(endTime, "minutes"));
    }

    $(".auction_div_row#"+insertTo + " .endtime").text(formatTime(endTime, "seconds"));
  });
}
/* ----- TIME END ----- */
/* -------------------- */

$(window).resize(function() {
  resizeAuto();
});

function resizeAuto(obj) {
  // console.log("Resize!");
  if(!isResizing) {
    isResizing = true;
    if(obj != null) {
      var target = $(obj).attr("href");
      var oldHeight = $('.tab-pane.active').height();
      $(target).height(oldHeight);
      setTimeout(function() {
        var newHeight = $(target).children('.overflow_div').outerHeight();
        $(".tab-pane.active").height(newHeight);
        isResizing = false;
      }, 300);
    } else {
      if($('#tab3.tab-pane.active').length !== 0 || $('#tab2.tab-pane.active') || $('#tab1.tab-pane.active').length !== 0) {
        var overflowHeight = $('.tab-pane.active .overflow_div').outerHeight();
        var tabHeight = $('.tab-pane.active').height();
        if(overflowHeight > tabHeight) {
          $(".tab-pane.active").height($('.tab-pane.active .overflow_div').outerHeight());
        } else if(overflowHeight < tabHeight) {
          $(".tab-pane.active").height($('.tab-pane.active .overflow_div').outerHeight());
        }
      }
      isResizing = false;
    }
  }
}

function resizeTo(newOverflowHeight) {
  var overflowHeight = $('#tab1.tab-pane.active').outerHeight();
}

window.onclick = function(e) {
  if($('.database_option_div').css('display') == 'block') {
    var target = $(e.target).closest($('.database_option_div')).length;
    if(!target) {
      toggleDatabaseOptions();
    }
  } else if($('.profile_option_div ').css('display') == 'block') {
    var target = $(e.target).closest($('.profile_option_div')).length;
    if(!target) {
      toggleProfileOptions();
    }
  }
}





/* ----- JQUERY UX STUFF ----- */
function errormessage(message) {
  $('.alert').css('color', '#721c24');
  $('.alert').css('background-color', '#f8d7da');
  $('.alert').css('border-color', '#f5c6cb');
  $('.alert').html(message);
  $('.alert').toggle("slow").delay(2000).toggle("slow");
}

function registermessage(callback) {
  $('.alert').css('color', '#21721c');
  $('.alert').css('background-color', '#d8f8d7');
  $('.alert').css('border-color', '#c6f5c6');
  $('.alert').html("Registrierung erfolgreich!");
  $('.alert').slideDown("slow").delay(500, function() {
    return callback();
  });
}

function createAuctionMessage(message, success) {
  var errorDiv = $('.create_auction_button_error > div');
  if(success) $(errorDiv).css('color', '#1d6e15');
  else $(errorDiv).css('color', '#6c1313');
  $(errorDiv).text(message);
  $(errorDiv).slideDown('slow', function() {
    setTimeout(function() {
      $(errorDiv).slideUp('slow');
    }, 750);
  });
}

function bidThisAuctionMessage(auctionTodo) {
  if(auctionTodo.user.username != DB.User.me.username) {
    if(auctionTodo.bidder.username == DB.User.me.username) {
      $("#"+auctionTodo.key).find(".auction_buttons").fadeOut("slow").promise().done(function() {
        $(this).html("<div class=your_bid>dein gebot</div>").fadeIn("slow");
      });
    } else {
      if(auctionTodo.buyoutprice > 0)
        var html = '<button class="bid_auction_button" type="button" name="button" onclick="clickBidAuctionButton(this)">Bieten</button> \
                    <button class="buy_auction_button" type="button" name="button" onclick="clickBuyAuctionButton(this)">Kaufen</button>';
      else
        var html = '<button class="bid_auction_button" type="button" name="button" onclick="clickBidAuctionButton(this)">Bieten</button>';

      $("#"+auctionTodo.key).find(".your_bid").fadeOut("slow").promise().done(function() {
        $("#"+auctionTodo.key).find(".auction_buttons").html(html);
        $(".bid_auction_button").css("display", "none");
        $(".buy_auction_button").css("display", "none");
        $(".bid_auction_button").fadeIn("slow");
        $(".buy_auction_button").fadeIn("slow");
      });
    }
  }
}

function buyThisAuctionMessage(auctionTodo, callback) {
  $("#"+auctionTodo.key).find(".auction_buttons").fadeOut("slow").promise().done(function() {
    $(this).html("<div class=your_bid>gekauft</div>").fadeIn("slow").promise().done(function() {
      return callback();
    });
  });
}

function auctionExpiredAlert(expiredAuctions, callback) {
  if(expiredAuctions.length != 0) {
    if(expiredAuctions.length == 1) $(".expired_auction_div_two").text(expiredAuctions.length + " Auktion ist abgelaufen.");
    else $(".expired_auction_div_two").text(expiredAuctions.length + " Auktionen sind abgelaufen.");
    slide();
  } else return callback();

  function slide() {
    if($('.expired_auction_div_two').css("display") != "none") $('.expired_auction_div_two').stop(false, false);

    var left = $(window).width() - 220;
    $('.expired_auction_div_two').show().animate({"left": left}, "slow", function() {
      setTimeout(function() {
        $('.expired_auction_div_two').animate({"left": "100%"}, "slow", function() {
          $(this).hide();
        });
      }, 1000);
    });
  }
}

function bidExpiredAlert(bids, callback) {
  if(bids.length != 0) {
    if(bids.length == 1) $(".expired_auction_div").text("Du hast " + bids.length + " Auktion gewonnen.");
    else $(".expired_auction_div").text("Du hast " + bids.length + " Auktionen gewonnen.");
    $(".expired_auction_div").slideDown("slow", function() {
      setTimeout(function() {
        $(".expired_auction_div").slideUp("slow");
      }, 1000);
    });
  }
}

function newBidAlert(message, callback) {
  var timeout = 0;
  if($('.expired_auction_div').css("display") != "none") $('.expired_auction_div').stop(false, false);

  $(".expired_auction_div").text(message);
  $(".expired_auction_div").slideDown("slow", function() {
    setTimeout(function() {
      $(".expired_auction_div").slideUp("slow");
    }, 1000);
  });
}

function auctionBuyedAlert(auctionTodo) {
  if(auctionTodo.user.username == DB.User.me.username) {
    newBidAlert("Auktion "+capitalizeFirstLetter(auctionTodo.name)+" für "+auctionTodo.buyoutprice+" verkauft." ,function() {});
  }
}

function switchRegister() {
  if($('.register_div #register').css('display') != 'none') {
    $('.register_div #register').slideUp("slow", function() {
      $('.register_div #login').slideDown("slow");
    });
  } else {
    $('.register_div #login').slideUp("slow", function() {
      $('.register_div #register').slideDown("slow");
    });
  }
}

function toggleDatabaseButton() {
  if($('.simulate_button_gradient').css('display') == 'none') $('.simulate_button_gradient').fadeIn("slow");
  else $('.simulate_button_gradient').fadeOut("slow");
}

function toggleDatabaseOptions() {
  if(!($('.profile_option_div').css('display') == 'none')) toggleProfileOptions();
  if($('.database_option_div').css('display') == 'none') $('.database_option_div').slideDown("slow");
  else $('.database_option_div').slideUp("slow");
}

function toggleProfileOptions() {
  if(!($('.database_option_div').css('display') == 'none')) toggleDatabaseOptions();
  if($('.profile_option_div').css('display') == 'none') $('.profile_option_div').slideDown("slow");
  else $('.profile_option_div').slideUp("slow");
}
