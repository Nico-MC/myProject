// SCREENS AND OPTIONS //
var mainScreenJSON;
var mainScreen, mainScreen_opened = false, tab;

function loadUI() {
  var width = 200;
  var height = 150;

  mainScreenJSON = {
  	id: 'myWindow',
  	component: 'Window',
  	header: { position: { x: 0, y: 0 }, height: 40, text: '' },
  	draggable: true,
  	// position: { x: mouseX, y: mouseY },
  	width: width,
  	height: height,

  	layout: [1, 3],
  	children: []
  }

  EZGUI.Theme.load(['modules/ezgui/assets/metalworks-theme/metalworks-theme.json'], function() {
    mainScreen = EZGUI.create(mainScreenJSON, 'metalworks');
    mainScreen.position.x = WIDTH/2-mainScreen.settings.width/2;
    mainScreen.position.y = HEIGHT/2-mainScreen.settings.height/2;
    mainScreen.visible = false;
    mainScreen_opened = false;
  });
}

function checkUi() {
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
