function loadPlayerTextures() {
    // create a texture from an image path
    var texture = PIXI.Texture.fromImage("media/playerSprites.png");

    var parts = [];
    var size = 90;

    for (var y = 0; y < 4; y++) {
      for (var x = 0; x < 5; x++) {

        var r = new PIXI.Rectangle(x * size, y * size, size, size);
        var part = new PIXI.Texture(texture, r);
        parts.push(part);
      }
    }

    // TODO a better way to import all this that isn't hard-coded.
    //      some sort of asset packing + json definition
    var textures = {
      'left': parts.slice(0, 5),
      'right': parts.slice(5, 10).reverse(),
      'up': parts.slice(10, 15),
      'down': parts.slice(15, 20),
    };
    
    return textures;
}

// TODO should be a singleton?
function Player(world, keybindings, w, h) {

    var body = world.add(0, 0, w, h);

    var direction = 'down';

    var player = {
      w: w,
      h: h,

      coins: 0,

      getDirection: function() {
        return direction;
      },

      setDirection: function(value) {
        direction = value;
      },

      getPosition: function() {
        return body.getPosition();
      },

      setPosition: function(x, y) {
        var objs = world.query(x, y, w, h);
        var blocked = false;
        for (var i = 0; i < objs.length; i++) {
          if (objs[i] !== body && objs[i].isBlock) {
            blocked = true;
            break;
          }
        }

        if (!blocked) {
          body.setPosition(x, y);
        }
      },

      getMovementState: function() {
        return movement.getState();
      },

      queryImmediateFront: function(distance) {
        distance = distance || 1;
        var pos = body.getPosition();

        switch (direction) {
          case 'up':
            var x1 = pos.x;
            var y1 = pos.y - distance;
            var w1 = w;
            var h1 = distance;
            break;

          case 'down':
            var x1 = pos.x;
            var y1 = pos.y + h;
            var w1 = w;
            var h1 = distance;
            break;

          case 'left':
            var x1 = pos.x - distance;
            var y1 = pos.y;
            var w1 = distance;
            var h1 = h;
            break;

          case 'right':
            var x1 = pos.x + w;
            var y1 = pos.y;
            var w1 = distance;
            var h1 = h;
            break;
        }
        return world.query(x1, y1, w1, h1);
      },
    };
    body.data = player;

    var movement = MovementHandler(player);

    var walkUp = movement.makeMovement('up', 0, -1);
    var walkDown = movement.makeMovement('down', 0, 1);
    var walkLeft = movement.makeMovement('left', -1, 0);
    var walkRight = movement.makeMovement('right', 1, 0);

    var keymap = {};

    function bindMove(keyName, move) {
      keymap[keyName + ' keydown'] = movement.start.bind(movement, move);
      keymap[keyName + ' keyup'] = movement.stop.bind(movement, move);
    }

    // TODO when keyup event happens during a different window
    //      e.g. keydown, cmd+tab away, let go of key, then cmd+tab back
    //      window focus/blur events?

    bindMove('Up', walkUp);
    bindMove('Down', walkDown);
    bindMove('Left', walkLeft);
    bindMove('Right', walkRight);

    keybindings.listen(function(eventname) {
      var handler = keymap[eventname];
      if (handler) {
        handler();
      }
    });

    return player;
}


function PlayerRenderer(player, container) {
  var textures = loadPlayerTextures();
  var layer = container.newLayer();

  var clip = new PIXI.MovieClip(textures['down']);
  // TODO scale player sprite images in actual image file
  clip.width = player.w;
  clip.height = player.h;
  clip.animationSpeed = 0.1;

  layer.addChild(clip);

  layer.addFrameListener(function() {
    var state = player.getMovementState();
    var percentComplete = state.getPercentComplete();
    var pos = state.getPositionAt(percentComplete);
    this.position.x = pos.x;
    this.position.y = pos.y;

    // TODO s/direction/name/
    var textureName = state.direction || player.getDirection();
    clip.textures = textures[textureName];

    // TODO
    var i = Math.floor(percentComplete * clip.textures.length);
    clip.gotoAndStop(i);
  });
}
