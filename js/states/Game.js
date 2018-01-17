var SpaceHipster = SpaceHipster || {};

// --- VARIABLES --- //
// MAP & LAYER //
var map, background, frontground, middleground;
// PLAYER-OPTIONS //
var playerStart, playerTransfer;
// OBSTACLES //
var obstacles;

//title screen
SpaceHipster.Game = function(){};

SpaceHipster.Game.prototype = {
  create: function() {
    // CREATE MAP //
    map = this.add.tilemap('map_01');
    this.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    map.addTilesetImage('set_01', 'set_01');

    background = map.createLayer('Background');
    middleground = map.createLayer('Middleground');
    frontground = map.createLayer('Frontground');
    playerStart = map.objects.PlayerStart[0];
    playerTransfer = map.objects.PlayerTransfer[0];
    obstacles = map.objects.Obstacles;
    collision_object_1 = obstacles[0];

    this.physics.startSystem(Phaser.Physics.ARCADE);


    // CREATE PLAYER //
    this.player = this.add.sprite(playerStart.x, playerStart.y, 'player'); // sprite
    // this.player.scale.setTo(2); // scale
    this.player.speed = 2;
    this.physics.enable(this.player, Phaser.Physics.ARCADE);

    this.camera.follow(this.player); // camera
    this.cursors = this.input.keyboard.createCursorKeys(); // movement
    this.physics.arcade.enable(this.player); // physics
    this.physics.arcade.enable(collision_object_1);
    this.player.body.collideWorldBounds = true; // world borders
    // this.player.animations.add('run', [0, 1, 2, 3], 5, true); // add animation

  },

  update: function() {



    // player movement
    if(this.cursors.up.isDown) {
      this.player.body.position.y -= this.player.speed;
      // this.player.animations.play('run'); // start animation
    }
    else if(this.cursors.down.isDown) {
      this.player.body.position.y += this.player.speed;
    }
    if(this.cursors.left.isDown) {
      this.player.body.position.x -= this.player.speed;
    }
    else if(this.cursors.right.isDown) {
      this.player.body.position.x += this.player.speed;
    }
  },
};
