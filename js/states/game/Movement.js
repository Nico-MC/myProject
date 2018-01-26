function createMovementAnimations() {
  // MOVEMENT //
  GAME.player.animations.add('down', [15,16,17,18], 10, true, 1);
  GAME.player.animations.add('up', [19,20,21,22], 10, true, 1);
  GAME.player.animations.add('left', [23,24,25,26], 10, true, 1);
  GAME.player.animations.add('right', [27,28,29,28], 10, true, 1);
  // FACING //
  // GAME.player.animations.add('lookUp', [2,20], 2, true, 1); exhausted
  GAME.player.animations.add('lookUp', [2], 2, false, 1);
  GAME.player.animations.add('lookDown', [0], 2, false, 1);
  GAME.player.animations.add('lookRight', [7], 2, true, 1);
  GAME.player.animations.add('lookLeft', [5], 2, true, 1);
}

var upKey, downKey, leftKey, rightKey;
var direction, totalDirection; // This is for a better movement feeling (personal preferences)
var firstTab = "";

function playMovementAnimations() {
  //  Reset the players velocity (movement)
  GAME.player.body.velocity.set(0);

  game.input.keyboard.onDownCallback = function(e) {
    newDirection = e.key;
    direction = e.key;
    if(firstTab == "") firstTab = direction;
  }
  game.input.keyboard.onUpCallback = function(e) {
    if(e.key == firstTab) firstTab = newDirection;
    direction = firstTab;
  }

  // console.log(direction);
  // console.log(newDirection);

  // --- FINAL MOVEMENT --- //
  if(upKey.isDown || downKey.isDown  || leftKey.isDown  || rightKey.isDown) {
    // console.log(game.input.keyboard);
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
    // this.player.animations.stop();
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

function playExtendMovementAnimations() {
  //  Reset the players velocity (movement)
  GAME.player.body.velocity.set(0);

  // player movement
  if(GAME.cursors.up.isDown && GAME.cursors.left.isDown) {
    GAME.player.body.velocity.x = -player_velocity;
    GAME.player.body.velocity.y = -player_velocity;
    GAME.player.animations.play('left');
  } else if (GAME.cursors.up.isDown && GAME.cursors.right.isDown) {
    GAME.player.body.velocity.x = player_velocity;
    GAME.player.body.velocity.y = -player_velocity;
    GAME.player.animations.play('right');
  } else if (GAME.cursors.down.isDown && GAME.cursors.left.isDown) {
    GAME.player.body.velocity.x = -player_velocity;
    GAME.player.body.velocity.y = player_velocity;
    GAME.player.animations.play('left');
  } else if (GAME.cursors.down.isDown && GAME.cursors.right.isDown) {
    GAME.player.body.velocity.x = player_velocity;
    GAME.player.body.velocity.y = player_velocity;
    GAME.player.animations.play('right');
  } else {
    if(GAME.cursors.up.isDown) {
      GAME.player.body.velocity.y = -player_velocity;
      GAME.player.animations.play('up');
      facing = 'up';
    } else if(GAME.cursors.down.isDown) {
      GAME.player.body.velocity.y = player_velocity;
      GAME.player.animations.play('down');
      facing = 'down';
    }

    if(GAME.cursors.left.isDown) {
      GAME.player.body.velocity.x = -player_velocity;
      GAME.player.animations.play('left');
      facing = 'left';
    } else if(GAME.cursors.right.isDown) {
      GAME.player.body.velocity.x = player_velocity;
      GAME.player.animations.play('right');
      facing = 'right';
    }
  }

  if(!(GAME.cursors.up.isDown || GAME.cursors.down.isDown || GAME.cursors.left.isDown || GAME.cursors.right.isDown)) {
    // this.player.animations.stop();
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

      default:
        facing = 'idle';
    }
  }
}
