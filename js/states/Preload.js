//loading the game assets
var preloadState = {
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
    this.load.spritesheet('player', 'assets/content/player/playerset.png', 64, 64, 30, 30); // sprite of player
    this.load.image('arrow', 'assets/content/images/arrow.png');

    this.load.setPreloadSprite(this.preloadBar);
  },
  create: function() {
  	this.state.start('Menu');
  }
};
