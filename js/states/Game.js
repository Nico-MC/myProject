var SpaceHipster = SpaceHipster || {};

// --- VARIABLES --- //
// PLAYER-OPTIONS //
var playerStart, playerTransfer;
var player_velocity = 80;
var facing = 'down';
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
    this.player = this.add.sprite(playerStart.x+playerStart.width/2+7, playerStart.y+playerStart.height/2-10, 'player'); // sprite
    var frontground = map.createLayer('Frontground');
    var overlays = map.createLayer('Overlays');


    // CONFIGURE PLAYER //
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.collideWorldBounds = true; // world borders
    this.player.body.setSize(20, 20, 0, 0);

    this.camera.follow(this.player); // camera
    this.cursors = this.input.keyboard.createCursorKeys(); // movement

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

    // MOVEMENT //
    this.player.animations.add('down', [15,16,17,18], 10, true, 1);
    this.player.animations.add('up', [19,20,21,22], 10, true, 1);
    this.player.animations.add('left', [23,24,25,26], 10, true, 1);
    this.player.animations.add('right', [27,28,29,28], 10, true, 1);
    // FACING //
    // this.player.animations.add('lookUp', [2,20], 2, true, 1); exhausted
    this.player.animations.add('lookUp', [2], 2, false, 1);
    this.player.animations.add('lookDown', [0], 2, false, 1);
    this.player.animations.add('lookRight', [7], 2, true, 1);
    this.player.animations.add('lookLeft', [5], 2, true, 1);
  },

  update: function() {
    for(var i=0; i<objectLayer.length; i++) {
      this.physics.arcade.collide(this.player, objectLayer.children[i]);
    }

    //  Reset the players velocity (movement)
    this.player.body.velocity.set(0);

    // player movement
    if(this.cursors.up.isDown) {
      this.player.body.velocity.y = -player_velocity;
      this.player.animations.play('up');
      facing = 'up';
    } else if(this.cursors.down.isDown) {
      this.player.body.velocity.y = player_velocity;
      this.player.animations.play('down');
      facing = 'down';
    }

    if(this.cursors.left.isDown) {
      this.player.body.velocity.x = -player_velocity;
      this.player.animations.play('left');
      facing = 'left';
    } else if(this.cursors.right.isDown) {
      this.player.body.velocity.x = player_velocity;
      this.player.animations.play('right');
      facing = 'right';
    }

    if(!(this.cursors.up.isDown || this.cursors.down.isDown || this.cursors.left.isDown || this.cursors.right.isDown)) {
      // this.player.animations.stop();
      switch(facing) {
        case 'up':
          this.player.animations.play('lookUp');
          break;
        case 'down':
          this.player.animations.play('lookDown');
          break;
        case 'left':
          this.player.animations.play('lookLeft');
          break;
        case 'right':
          this.player.animations.play('lookRight');
          break;
        default:
          facing = 'idle';
      }
    }
  },

  render: function() {
    // this.game.debug.body(objectLayer.children[0]);
    // this.game.debug.body(this.player);
  }

};
