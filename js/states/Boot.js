// setting game configuration and loading the assets for the loading screen
var bootState = {
  preload: function() {
  	// assets we'll use in the loading screen
    this.load.image('logo', 'assets/content/images_old/logo.png');
    this.load.image('preloadbar', 'assets/content/images_old/preloader-bar.png');
  },
  create: function() {

    // scaling options
  	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  	this.scale.minWidth = 240;
  	this.scale.minHeight = 170;
  	this.scale.maxWidth = 2880;
  	this.scale.maxHeight = 1920;

  	// have the game centered horizontally
  	this.scale.pageAlignHorizontally = true;

    this.state.start('Preload');
  }
};
