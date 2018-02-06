var cursor, player_velocity = 80, facing = 'down'; // Move
var direction, newDirection, firstTab // temp for better movement

function createMovementAnimations() {
  // MOVEMENT //
  GAME.player.animations.add('down', [15,16,17,18], 10, false, 1);
  GAME.player.animations.add('up', [19,20,21,22], 10, false, 1);
  GAME.player.animations.add('left', [23,24,25,26], 10, false, 1);
  GAME.player.animations.add('right', [27,28,29,28], 10, false, 1);
  // FACING //
  // GAME.player.animations.add('lookUp', [2,20], 2, true, 1); exhausted
  GAME.player.animations.add('lookUp', [2], 2, false, 1);
  GAME.player.animations.add('lookDown', [0], 2, false, 1);
  GAME.player.animations.add('lookRight', [7], 2, false, 1);
  GAME.player.animations.add('lookLeft', [5], 2, false, 1);

  // game.input.keyboard.onDownCallback = function(e) {
  //   if(e.key != "tab") {
  //     newDirection = e.key;
  //     direction = e.key;
  //     if(firstTab == "") firstTab = direction;
  //   }
  // }
  // game.input.keyboard.onUpCallback = function(e) {
  //   if(e.key != "tab") {
  //     if(e.key == firstTab) firstTab = newDirection;
  //     direction = firstTab;
  //   }
  // }

  game.input.keyboard.onDownCallback = function(e) {
    if(e.key == "ArrowUp" || e.key == "ArrowDown" || e.key == "ArrowLeft" || e.key == "ArrowRight") {
      direction = e.key;
      if(firstTab == "") firstTab = direction;
    }
  }
  game.input.keyboard.onUpCallback = function(e) {
    if(e.key == "ArrowUp" || e.key == "ArrowDown" || e.key == "ArrowLeft" || e.key == "ArrowRight") {
      if(e.key == firstTab) firstTab = direction;
      if(direction != firstTab) direction = firstTab;
    }
  }
}

function playMovementAnimations() {
  //  Reset the players velocity (movement)
  GAME.player.body.velocity.set(0);
console.log(direction);
  // --- FINAL MOVEMENT --- //
  if(upKey.isDown || downKey.isDown  || leftKey.isDown  || rightKey.isDown) {
    if(direction == "ArrowUp") {
      GAME.player.body.velocity.y = -player_velocity;
      GAME.player.animations.play('up');
      facing = 'up';
    }
    if(direction == "ArrowDown") {
      GAME.player.body.velocity.y = player_velocity;
      GAME.player.animations.play('down');
      facing = 'down';
    }
    if(direction == "ArrowLeft") {
      GAME.player.body.velocity.x = -player_velocity;
      GAME.player.animations.play('left');
      facing = 'left';
    }
    if(direction == "ArrowRight") {
      GAME.player.body.velocity.x = player_velocity;
      GAME.player.animations.play('right');
      facing = 'right';
    }
  } else {
    firstTab = "";
    direction = "";
    switch(facing) {
      case 'up':
        GAME.player.animations.play('lookUp');
        break;
      case 'down':
        GAME.player.animations.play('lookDown');
        break;
      case 'left':
        GAME.player.animations.play('lookLeft');
        break;
      case 'right':
        GAME.player.animations.play('lookRight');
        break;
    }
  }
}
