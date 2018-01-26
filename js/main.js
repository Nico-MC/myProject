var SpaceHipster = SpaceHipster || {};

game = new Phaser.Game(400, 400, Phaser.AUTO, 'my-game');

game.state.add('Boot', bootState);
game.state.add('Preload', preloadState);
game.state.add('Menu', menuState);
game.state.add('Game', gameState);

game.state.start('Boot');
