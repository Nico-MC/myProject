// SCREENS AND OPTIONS //
var mainScreen, mainScreen_opened = false, mainScreenJSON;
var shop, shop_opened = false;

function gui_setup() {
  var clickObject_1 = EZGUI.components.second_tab;

  clickObject_1.on('click', function() {
    if(EZGUI.components.first_tab.text == 'Koordinaten: ') EZGUI.components.first_tab.text += '53/17';
    else EZGUI.components.first_tab.text = 'Koordinaten: ' + '53/18';

    gui_checkShop();
  });
}

function gui_load() {
  var gui_width = 200;
  var gui_height = 150;
  mainScreenJSON = loadJSON(gui_width, gui_height);
  EZGUI.Theme.load(['modules/ezgui/assets/metalworks-theme/metalworks-theme.json'], function() {
    mainScreen = EZGUI.create(mainScreenJSON, 'metalworks');
    mainScreen.position.x = WIDTH/2 - gui_width/2;
    mainScreen.position.y = HEIGHT/2 - gui_height/2;
    mainScreen.visible = false;
    mainScreen_opened = false;

    gui_setup();
    gui_buildShop();
  });
}

function gui_check() {
  if(!mainScreen_opened) {
    mainScreen.visible = true;
    mainScreen_opened = true;
  } else {
    mainScreen.visible = false;
    mainScreen_opened = false;
  }
}

function gui_buildShop() {
  var shop_width = GAME.scale.width;
  var shop_height = 200;
  var shop_backgroundColor = 'red';
  var shop_position = 'absolute';
  var shop_left = GAME.scale.offset.x;
  var shop_bottom = 0;
  var shop_display = 'none'; // On create

  shop = $('.shop')[0]; // initialize shop
  // DEFAULT
  $(shop).css('width', shop_width);
  $(shop).css('height', shop_height);
  $(shop).css('background-color', shop_backgroundColor);
  // POSITION
  $(shop).css('position', shop_position);
  $(shop).css('left', shop_left);
  $(shop).css('bottom', shop_bottom);
  // DISPLAY
  $(shop).css('display', shop_display);
}

function gui_resize() {
  var canvas_width = GAME.scale.width;
  var canvas_left = GAME.scale.offset.x;

  $(shop).css('width', canvas_width);
  $(shop).css('left', canvas_left);
}

function gui_update() {}

function gui_checkShop() {
  // if(!shop_opened) {
  //   $('.shop').css('display', 'block');
  //   EZGUI.components.second_tab.text = 'Schließen';
  //   shop_opened = true;
  // } else {
  //   $('.shop').css('display', 'none');
  //   EZGUI.components.second_tab.text = 'Öffnen';
  //   shop_opened = false;
  // }
console.log("sads");
  $(shop).slideToggle();
}
