// SCREENS AND OPTIONS - VARIABLES //
var window_1, window_1_opened = false;
var window_2, window_2_opened = false;
var shop, shop_opened = false;
var auctionHouse_opened = false, i = 0, arrow, arrow_position_default_y, arrow_tween1, arrow_tween2;

// --- GUI DEFAULT-FUNCTIONS --- //
function gui_setup() {
  var shop_button = $('#shop_button');
  var stats_button = $('#stats_button');
  var auctionhouse_button = $('#auctionhouse_button');
  var myGame = $('#my-game');

  stats_button.on('click', function() {
    if($('.shop_content').css('display') == 'inline-block') gui_check_shop('statsContent', true);
    else gui_check_shop('statsContent');
  });

  shop_button.on('click', function() {
    if($('.stats_content').css('display') == 'inline-block') gui_check_shop('shopContent', true);
    else gui_check_shop('shopContent');
  });

  window.onclick = function() {
    $('#navbar_toggler').blur();
  };

  // Clear text search_field
  document.getElementById("search").value = "";

  /*window.onclick = function(e) {
    var target_shop = $(e.target).closest(shop).length;
    var target_window_1 = $(e.target).closest(window_1).length;

    // console.log("X: " + e.clientX + "  ----- " + "Y: " + e.clientY);

    if(!(target_shop || target_window_1)) {
      // gui_close_window1();
      // gui_close_shop();
    }
  }*/

  $(window).keyup(function(e) {
    if (e.keyCode === 13) {
      if(arrow.visible == true && !auctionHouse_opened) {
        gui_open_auctionhouse();
      }
    } else if(e.keyCode === 27) {
      if(auctionHouse_opened == true) {
        gui_close_auctionhouse();
      }
    }
  });
}

function gui_load() {
  window_1 = $('.window_1')[0];
  window_2 = $('.window_2')[0];
  shop = $('.shop')[0]; // initialize shop
  gui_build_shop();
  gui_build_window1();
  gui_build_window2();
  gui_setup();
}

function gui_resize() {
  var canvas_left = GAME.scale.offset.x;
  var canvas_width = GAME.scale.width;
  var window_1_width = canvas_width/2;
  var window_1_left = canvas_left + canvas_width/2 - window_1_width/2;
  var window_2_width = $(window_2).width();
  var window_2_left = canvas_left + canvas_width/2 - window_2_width/2;

  $(window_1).css('left', window_1_left);
  $(window_2).css('left', window_2_left);
  $(shop).css('left', canvas_left);
}

function gui_update() {}

// --- GUI BUILD-FUNCTIONS --- //
function gui_build_window1() {
  var window_1_width = GAME.scale.width/2;
  var window_1_height = $(window_1).height();
  var window_1_left = GAME.scale.offset.x + GAME.scale.width/2 - window_1_width/2;
  var window_1_bottom = 0 + $(shop).height() + 20;
  $(window_1).css('width', window_1_width);
  $(window_1).css('left', window_1_left);
  $(window_1).css('bottom', window_1_bottom);
}

function gui_build_window2() {
  var window_2_width = $(window_2).width();
  var window_2_height = $(window_2).height();
  var window_2_left = (GAME.scale.offset.x + GAME.scale.width/2) - window_2_width/2;
  var window_2_bottom = GAME.scale.height - window_2_height ;

  $('.window_2').css('left', window_2_left);
  $('.window_2').css('bottom', window_2_bottom);
}

function gui_build_shop() {
  var shop_width = GAME.scale.width;
  var shop_height = 200;
  var shop_left = GAME.scale.offset.x;
  var shop_bottom = 0;

  $(shop).css('width', shop_width);
  $(shop).css('height', shop_height);
  $(shop).css('left', shop_left);
  $(shop).css('bottom', shop_bottom);
}

// --- CHECK WINDOW-FUNCTIONS --- //
function gui_check_window1() {
  if(window_1_opened) gui_close_window1();
  else gui_open_window1();
}

function gui_open_window1() {
  $(window_1).show();
  window_1_opened = true;
}

function gui_close_window1() {
  $(window_1).hide();
  window_1_opened = false;
}

function gui_open_window2() {
  $('.window_2').show();
}

function gui_close_window2() {
  $('.window_2').hide();
}


// --- CHECK SHOP-FUNCTIONS --- //
function gui_check_shop(content, toggle) {
  if(toggle) {
    gui_close_shop(function() {
      gui_open_shop(content);
    });
  }
  else {
    if(shop_opened) gui_close_shop();
    else gui_open_shop(content);
  }
}

function gui_open_shop(content) {
  gui_check_content(content);
  $(shop).slideDown("slow", function() {
    shop_opened = true;
  });
}

function gui_close_shop(callback) {
  $(shop).slideUp("slow", function() {
    shop_opened = false;
    $('.shop_content').css('display', 'none');
    $('.stats_content').css('display', 'none');
    if(callback) callback();
  });
}

function gui_check_content(content) {
  if(content == "shopContent") {
    $('.shop_content').css('display', 'inline-block');
    $('.stats_content').css('display', 'none');
  } else if(content == "statsContent") {
    $('.shop_content').css('display', 'none');
    $('.stats_content').css('display', 'inline-block');
  }
}

// --- AUCTIONHOUSE-FUNCTIONS --- //
function gui_open_auctionhouse() {
  auctionHouse_opened = true;
  $(".game_container").slideUp("slow", function(e) {
    $(".auctionhouse_container").slideDown();
    game.paused = true;
  });
  game.scale.refresh();
}

function gui_close_auctionhouse() {
  auctionHouse_opened = false;
  $(".game_container").slideDown("slow", function(e) {
    game.paused = false;
  });
  game.scale.refresh();
  $(".auctionhouse_container").slideUp();
}

function gui_check_auctionhouse(overlap) {
  if(overlap) {
    if(i == 0) {
      arrow.visible = true;
      i++;
      arrow_tween1 = GAME.add.tween(arrow).from( { y: arrow_position_default_y }, 0, Phaser.Easing.Bounce.Out, true);
      arrow_tween2 = GAME.add.tween(arrow).to({ y: arrow.y - 10 }, 0, Phaser.Easing.Sinusoidal.InOut, true, 0, 1, true).loop(true);
    }
  } else if(i != 0) {
    arrow.visible = false;
    i = 0;
    if(arrow_tween1 != null && arrow_tween2 != null) {
      GAME.tweens.remove(arrow_tween1);
      GAME.tweens.remove(arrow_tween2);
      if(auctionHouse_opened) gui_close_auctionhouse();
    }
  } else {
    // want to open it through console? You sneaky rascal you!
    if($('.auctionhouse_container').css('display') != 'none') gui_close_auctionhouse();
  }
}
