// --- GLOBAL VARIABLES --- //
var GAME;
// PLAYER-OPTIONS //
var player, playerStart, playerTransfer; // Create
// COLLISION OBJECTS //
var objectLayer; // Collide

// --- CREATE THE GAME --- //
GAME = {
  preload: function() {
    // affects the performance heavily!
    this.time.advancedTiming = false;
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
    background.renderSettings.enableScrollDelta = false;
    middleground.renderSettings.enableScrollDelta = false;
    frontground.renderSettings.enableScrollDelta = false;
    overlays.renderSettings.enableScrollDelta = false;


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
    tab = game.input.keyboard.addKey(Phaser.Keyboard.TAB);

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
      console.log("timing is on!");
    }

    createMovementAnimations();

    // If user press 'TAB' for opening Ui
    gui_load();
    tab = game.input.keyboard.addKey(Phaser.Keyboard.TAB);
    tab.onDown.add(gui_check, this);
  },

  update: function() {
    playMovementAnimations();
    gui_update();






    // Render collision layers
    GAME.physics.arcade.collide(GAME.player, objectLayer.children[0]);
    GAME.physics.arcade.collide(GAME.player, objectLayer.children[1]);
    GAME.physics.arcade.collide(GAME.player, objectLayer.children[2]);
    GAME.physics.arcade.collide(GAME.player, objectLayer.children[3]);
    GAME.physics.arcade.collide(GAME.player, objectLayer.children[4]);
    GAME.physics.arcade.collide(GAME.player, objectLayer.children[5]);
    GAME.physics.arcade.collide(GAME.player, objectLayer.children[6]);
    GAME.physics.arcade.collide(GAME.player, objectLayer.children[7]);
    GAME.physics.arcade.collide(GAME.player, objectLayer.children[8]);
    GAME.physics.arcade.collide(GAME.player, objectLayer.children[9]);
    GAME.physics.arcade.collide(GAME.player, objectLayer.children[10]);
  }
};
