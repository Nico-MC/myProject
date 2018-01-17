var SpaceHipster = SpaceHipster || {};

SpaceHipster.Boot = function(){};

//setting game configuration and loading the assets for the loading screen
SpaceHipster.Boot.prototype = {
  preload: function() {
  	//assets we'll use in the loading screen
    this.load.image('logo', 'assets/content/images_old/logo.png');
    this.load.image('preloadbar', 'assets/content/images_old/preloader-bar.png');
  },
  create: function() {
  	// //loading screen will have a white background
    // this.game.stage.backgroundColor = '#fff';
    //
    // //scaling options
  	// this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  	// this.scale.minWidth = 240;
  	// this.scale.minHeight = 170;
  	// this.scale.maxWidth = 2880;
  	// this.scale.maxHeight = 1920;
    //
  	// //have the game centered horizontally
  	// this.scale.pageAlignHorizontally = true;
    //
  	// //screen size will be set automatically
  	// // Phaser.ScaleManager.setScreenSize(true);
    //
  	// //physics system for movement
  	// this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.state.start('Preload');
  }
};
