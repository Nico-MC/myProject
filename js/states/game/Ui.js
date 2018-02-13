// SCREENS AND OPTIONS - VARIABLES //
var window_1, window_1_opened = false;
var shop, shop_opened = false;

// --- GUI DEFAULT-FUNCTIONS --- //
function gui_setup() {
  var shop_button = $('#shop_button');

  shop_button.on('click', function() {
    gui_check_Shop();
  });

  window.onclick = function(e) {
    var target_shop = $(e.target).closest(shop).length;
    var target_window_1 = $(e.target).closest(window_1).length;

    if(!(target_shop || target_window_1)) {
      gui_close_Window1();
      gui_close_Shop();
    }
  }
}

function gui_load() {
  window_1 = $('.window_1')[0];
  shop = $('.shop')[0]; // initialize shop
  gui_build_Shop();
  gui_build_Window1();
  gui_setup();
}

function gui_resize() {
  var canvas_left = GAME.scale.offset.x;
  var window_1_width = GAME.scale.width/2;
  var window_1_left = GAME.scale.offset.x + GAME.scale.width/2 - window_1_width/2;

  $(window_1).css('left', window_1_left);
  $(shop).css('left', canvas_left);
}

function gui_update() {}

// --- GUI BUILD-FUNCTIONS --- //
function gui_build_Window1() {
  var window_1_width = GAME.scale.width/2;
  // var window_1_height = GAME.scale.height/4;
  var window_1_height = $(window_1).height();
  var window_1_left = GAME.scale.offset.x + GAME.scale.width/2 - window_1_width/2;
  var window_1_bottom = 0 + $(shop).height() + 20;
  $(window_1).css('width', window_1_width);
  // $(window_1).css('height', window_1_height);
  $(window_1).css('left', window_1_left);
  $(window_1).css('bottom', window_1_bottom);
}

function gui_build_Shop() {
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
function gui_check_Window1() {
  if(window_1_opened) gui_close_Window1();
  else gui_open_Window1();
}

function gui_open_Window1() {
  $(window_1).show();
  window_1_opened = true;
}

function gui_close_Window1() {
  $(window_1).hide();
  window_1_opened = false;
}

// --- CHECK GUI-FUNCTIONS --- //
function gui_check_Shop() {
  if(shop_opened) gui_close_Shop();
  else gui_open_Shop();
}

function gui_open_Shop() {
  $(shop).slideDown();
  shop_opened = true;
}

function gui_close_Shop() {
  $(shop).slideUp();
  shop_opened = false;
}
