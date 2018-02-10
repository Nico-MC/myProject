// SCREENS AND OPTIONS //
var mainScreen, mainScreen_opened = false, mainScreenJSON;

function gui_setup() {
  var clickObject_1 = EZGUI.components.second_tab;

  clickObject_1.on('click', function() {
    if(EZGUI.components.first_tab.text == 'Koordinaten: ') EZGUI.components.first_tab.text += '53/17';
    else EZGUI.components.first_tab.text = 'Koordinaten: ' + '53/18';

    gui_buildShop();
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
  });
}

function gui_check() {
  if(!mainScreen_opened) {
    mainScreen.visible = true;
    // game.paused = true;
    mainScreen_opened = true;
  } else {
    mainScreen.visible = false;
    // game.paused = false;
    mainScreen_opened = false;
  }
}

function gui_buildShop() {
  var ui_width = WIDTH;
  var ui_height = HEIGHT/2;
  var ui_backgroundColor = 'red';

  var ui_top = $('canvas').offset().top + $('canvas').height() - ui_height;
  var ui_left = $('canvas').offset().left + ($('canvas').width() - ui_width)/2;

  $('#my-game').append('<div class=shop></div>');
  // DEFAULT
  $('.shop').css('width', ui_width);
  $('.shop').css('height', ui_height);
  $('.shop').css('background-color', ui_backgroundColor);
  // POSITION
  $('.shop').css('position', 'absolute');
  $('.shop').css('top', ui_top);
  $('.shop').css('left', ui_left);
  // SCALING
}

function gui_resize() {
  var canvas_width = $('canvas').width();
  var canvas_height = $('canvas').height();
  var canvas_position = 'absolute';
  var canvas_top = GAME.scale.offset.y;
  var canvas_left = GAME.scale.offset.x;
  var canvas_position = $('canvas').position();

  console.log(canvas_left);
  // $('.ui_container').css('width', canvas_width);
  // $('.ui_container').css('height', canvas_height);
  // $('.ui_container').css('position', canvas_position);
  // $('.ui_container').css('top', canvas_top);
  $('.shop').css('left', canvas_left);

}

function gui_update() {
  // GAME.player.position.x;
}
