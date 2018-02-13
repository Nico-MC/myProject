// SCREENS AND OPTIONS //
var window_1, window_1_opened = false;
var shop, shop_opened = false;

function gui_setup() {
  var clickObject_1 = shop;

  clickObject_1.on('click', function() {
    gui_checkShop();
  });
}

function gui_load() {
  window_1 = $('.gui_1')[0];

  shop = $('.shop')[0]; // initialize shop
  gui_build_Window1();
  gui_build_Shop();
}

function gui_check() {
  if(!window_1_opened) {
    $(window_1).show();
    window_1_opened = true;
  } else {
    $(window_1).hide();
    window_1_opened = false;
  }
}

function gui_build_Window1() {
  var window_1_width = GAME.scale.width/2;
  var window_1_height = GAME.scale.height/4;
  var window_1_left = GAME.scale.offset.x + GAME.scale.width/2 - window_1_width/2;
  var window_1_bottom = GAME.scale.height/2 - window_1_height/2;

  $(window_1).css('width', window_1_width);
  $(window_1).css('height', window_1_height);
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

function gui_resize() {
  var canvas_width = GAME.scale.width;
  var canvas_left = GAME.scale.offset.x;

  $(shop).css('width', canvas_width);
  $(shop).css('left', canvas_left);
}

function gui_update() {}

function gui_checkShop() {
  $(shop).slideToggle();
}
