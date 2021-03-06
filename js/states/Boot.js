// setting game configuration and loading the assets for the loading screen
var bootState = {
  preload: function() {
  	// assets we'll use in the loading screen
    this.load.image('logo', 'assets/content/images_old/logo.png');
    this.load.image('preloadbar', 'assets/content/images_old/preloader-bar.png');
  },
  create: function() {

    // scaling options
    this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
  	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  	this.scale.minWidth = 400;
  	this.scale.minHeight = 400;
  	this.scale.maxWidth = 800;
  	this.scale.maxHeight = 800;

  	// have the game centered horizontally
  	this.scale.pageAlignHorizontally = false;
    this.game.scale.refresh();
    $(window).on('resize', function() {
      setTimeout(function() {
        if(typeof GAME.scale !== 'undefined') {
          GAME.resize();
          gui_resize();
        }
      }, 150);
    });

    this.state.start('Preload');
  }
};
