var SpaceHipster = SpaceHipster || {};

//loading the game assets
SpaceHipster.Preload = function(){};

SpaceHipster.Preload.prototype = {
  preload: function() {
  	//show logo in loading screen
  	this.splash = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
    this.splash.anchor.setTo(0.5);

    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);

    // LOAD TILEMAP //
    this.load.tilemap('map_01', 'assets/content/map/map_01.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('set_01', 'assets/content/map/set_01.png');
    // LOAD PLAYER //
    this.load.spritesheet('player', 'assets/content/player/playerset.png', 20, 20, 1, 30); // sprite of player


    // LOADING TEST-SPRITES //
    this.load.spritesheet('test_1', 'assets/content/images_old/player.png', 12, 12);

    this.load.setPreloadSprite(this.preloadBar);
  },
  create: function() {
  	this.state.start('MainMenu');
  }
};
