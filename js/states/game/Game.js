// --- GLOBAL VARIABLES --- //
var GAME;
// PLAYER-OPTIONS //
var player, playerStart, playerTransfer; // Create
var cursor, player_velocity = 80, facing = 'down'; // Move
// COLLISION OBJECTS //
var objectLayer; // Collide
// SCREENS AND OPTIONS //
var mainScreenJSON;
var mainScreen, mainScreen_opened = false;

// --- CREATE THE GAME --- //
GAME = {
  preload: function() {
    this.time.advancedTiming = true;
  },

  create: function() {

    // CREATE MAP //
    map = this.add.tilemap('map_01');
    this.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    map.addTilesetImage('set_01', 'set_01');

    // OBJECTS //
    playerStart = map.objects.PlayerStart[0];
    playerTransfer = map.objects.PlayerTransfer[0];
    var collisionObjects = map.objects.CollisionObjects;

    // LAYERS //
    var background = map.createLayer('Background');
    var middleground = map.createLayer('Middleground');
    this.player = this.add.sprite(playerStart.x+playerStart.width/2+7, playerStart.y+playerStart.height/2-10, 'player'); // sprite
    var frontground = map.createLayer('Frontground');
    var overlays = map.createLayer('Overlays');


    // CONFIGURE PLAYER //
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.collideWorldBounds = true; // world borders
    this.player.body.setSize(20, 20, 0, 0);
    this.player.scale.setTo(1.3);

    this.camera.follow(this.player); // camera

    upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

    /*
      GET OBJECTS OUT OF map_01.json
      CREATE EMPTY SPRITES WITH THEIR COORDINATES AND SIZES
    */
    objectLayer = this.add.group(); // add group
    for(var i=0; i<collisionObjects.length; i++) {
      objectLayer.create(collisionObjects[i].x, collisionObjects[i].y, null);
      this.physics.enable(objectLayer.children[i], Phaser.Physics.ARCADE); // enable physics for each layer
      objectLayer.children[i].width = collisionObjects[i].width;
      objectLayer.children[i].height = collisionObjects[i].height;
      objectLayer.children[i].body.immovable = true;
    }

    if (this.time.advancedTiming) {
      // this.plugins.add(Phaser.Plugin.AdvancedTiming); funktioniert hier nicht mehr (veraltet).
      this.timing = this.add.plugin(Phaser.Plugin.AdvancedTiming);
    }

    createMovementAnimations();

    this.player.inputEnabled = true;
    this.player.events.onInputDown.add(listener_onPlayer, this);


    // AT LAST BUT NOT LEAST ... THE UI
    loadUI();
  },

  update: function() {
    for(var i=0; i<objectLayer.length; i++) {
      this.physics.arcade.collide(this.player, objectLayer.children[i]);
    }

    playMovementAnimations(this);
  },

  render: function() {
    // this.game.debug.body(objectLayer.children[0]);
    // this.game.debug.body(this.player);
  }

};

function listener_onPlayer() {
  var mouseX = game.input.mousePointer.x;
  var mouseY = game.input.mousePointer.y;

  if(mainScreen != null) {
    if(!mainScreen_opened) {
      mainScreen.visible = true;
      mainScreen.position.x = mouseX;
      mainScreen.position.y = mouseY;
      mainScreen_opened = true;
    } else {
      mainScreen.visible = false;
      mainScreen_opened = false;
    }
  } else {
    mainScreen = EZGUI.create(mainScreenJSON, 'metalworks');
    mainScreen.position.x = mouseX;
    mainScreen.position.y = mouseY;
    mainScreen_opened = true;
  }
}
