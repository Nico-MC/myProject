function startGame() {
  var WIDTH = 400;
  var HEIGHT = 400;

  game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'my-game');

  game.state.add('Boot', bootState);
  game.state.add('Preload', preloadState);
  game.state.add('Menu', menuState);
  game.state.add('Game', GAME);

  game.state.start('Boot');
}
