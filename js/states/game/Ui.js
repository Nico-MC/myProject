// SCREENS AND OPTIONS //
var mainScreen, mainScreen_opened = false, mainScreenJSON;

function setupGUI() {
  var clickObject_1 = EZGUI.components.second_tab;
  console.log(clickObject_1);

  // clickObject_1.on('click', function() {
  //   if(EZGUI.components.first_tab.text == 'Koordinaten: ') EZGUI.components.first_tab.text += '53/17';
  //   else EZGUI.components.first_tab.text = 'Koordinaten: ' + '53/18';
  // });
}

function loadGUI() {
  mainScreenJSON = loadJSON();

  EZGUI.Theme.load(['modules/ezgui/assets/metalworks-theme/metalworks-theme.json'], function() {
    mainScreen = EZGUI.create(mainScreenJSON, 'metalworks');
    mainScreen.position.x = WIDTH/2-mainScreen.settings.width/2;
    mainScreen.position.y = HEIGHT/2-mainScreen.settings.height/2;
    mainScreen.visible = false;
    mainScreen_opened = false;

    setupGUI();
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

function updateUi() {
  // GAME.player.position.x;
}
