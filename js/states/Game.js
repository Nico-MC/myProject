var SpaceHipster = SpaceHipster || {};

// --- VARIABLES --- //
// PLAYER-OPTIONS //
var playerStart, playerTransfer;
var player_velocity = 100;
// COLLISION OBJECTS //
var objectLayer;
//title screen
SpaceHipster.Game = function(){};

SpaceHipster.Game.prototype = {
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
    this.player = this.add.sprite(playerStart.x, playerStart.y, 'player'); // sprite
    var frontground = map.createLayer('Frontground');
    var overlays = map.createLayer('Overlays');


    // CONFIGURE PLAYER //
    // this.player.scale.setTo(2); // scale
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.collideWorldBounds = true; // world borders
    this.player.speed = 2;

    this.camera.follow(this.player); // camera
    this.cursors = this.input.keyboard.createCursorKeys(); // movement


    // PHYSICS //
    // map.createFromObjects('CollisionObjects', 34, '', 0, true, false, obstacles);

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
  },

  update: function() {

    for(var i=0; i<objectLayer.length; i++) {
      this.physics.arcade.collide(this.player, objectLayer.children[i]);
    }

    //  Reset the players velocity (movement)
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;

    // player movement
    if(this.cursors.up.isDown) {
      this.player.body.velocity.y = -player_velocity;
      // this.player.animations.play('run'); // start animation
    }
    else if(this.cursors.down.isDown) {
      this.player.body.velocity.y = player_velocity;
    }
    if(this.cursors.left.isDown) {
      this.player.body.velocity.x = -player_velocity;
    }
    else if(this.cursors.right.isDown) {
      this.player.body.velocity.x = player_velocity;
    }
  },

  render: function() {
    // this.game.debug.body(objectLayer.children[0]);
    // this.game.debug.body(this.player);
  }
};
