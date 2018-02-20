// --- GLOBAL VARIABLES --- //
var GAME, map;
// LAYER-OBJECTS //
var player, playerStart, playerTransfer, auctionHouseOpen; // Create
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
    collisionObjects = map.objects.CollisionObjects;

    var obj = map.objects.AuctionHouseOpen[0];
    auctionHouseOpen = game.add.sprite(obj.x, obj.y, null);
    this.physics.enable(auctionHouseOpen, Phaser.Physics.ARCADE);
    auctionHouseOpen.body.setSize(obj.width, obj.height);

    // LAYERS //
    var background = map.createLayer('Background');
    var middleground = map.createLayer('Middleground');
    this.player = this.add.sprite(0, 0, 'player'); // sprite
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
    this.player.x = playerStart.x+playerStart.width/2-this.player.body.width/2;
    this.player.y = playerStart.y+playerStart.height/2-this.player.body.height/2;

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

    arrow = GAME.add.sprite(0, 0, 'arrow');
    arrow.scale.setTo(0.5);
    arrow.position.x = auctionHouseOpen.x+auctionHouseOpen.body.width/2-arrow.width/2+2.5;
    arrow.y = auctionHouseOpen.y+20;
    arrow.visible = false;
    arrow_position_default_y = arrow.position.y;

    if (this.time.advancedTiming) {
      // this.plugins.add(Phaser.Plugin.AdvancedTiming); funktioniert hier nicht mehr (veraltet).
      this.timing = this.add.plugin(Phaser.Plugin.AdvancedTiming);
      console.log("timing is on!");
    }

    createMovementAnimations();

    // If user press 'TAB' for opening Ui
    gui_load();
    tab = game.input.keyboard.addKey(Phaser.Keyboard.TAB);
    tab.onDown.add(gui_check_window1, this);

    $(window).on('resize', function(e) {
      setTimeout(function() {
        if(typeof GAME.scale !== 'undefined') {
          GAME.resize();
          gui_resize();
        }
      }, 150);
    });
  },

  update: function() {
    playMovementAnimations();
    gui_check_auctionhouse(this.physics.arcade.overlap(this.player, auctionHouseOpen));

    // Render collision layers
    this.physics.arcade.collide(this.player, objectLayer.children[0]);
    this.physics.arcade.collide(this.player, objectLayer.children[1]);
    this.physics.arcade.collide(this.player, objectLayer.children[2]);
    this.physics.arcade.collide(this.player, objectLayer.children[3]);
    this.physics.arcade.collide(this.player, objectLayer.children[4]);
    this.physics.arcade.collide(this.player, objectLayer.children[5]);
    this.physics.arcade.collide(this.player, objectLayer.children[6]);
    this.physics.arcade.collide(this.player, objectLayer.children[7]);
    this.physics.arcade.collide(this.player, objectLayer.children[8]);
    this.physics.arcade.collide(this.player, objectLayer.children[9]);
    this.physics.arcade.collide(this.player, objectLayer.children[10]);
  },

  render: function() {
    // game.debug.body(this.player);
    // game.debug.body(auctionHouseOpen);
  },

  resize: function() {}
};
