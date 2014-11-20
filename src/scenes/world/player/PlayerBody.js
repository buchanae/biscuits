define(['../Body', 'utils'], function(Body, utils) {

  function PlayerBody(x, y, world) {
    var body = Body(x, y, 1, 1, false, world);
    var originalSetPosition = body.setPosition;

    function setPosition(x, y) {
        var blocks = isBlocked(x, y);

        if (blocks.length == 0) {
          originalSetPosition(x, y);
          triggerCollisions();

        } else {
          for (var i = 0, ii = blocks.length; i < ii; i++) {
            blocks[i].events.trigger('player collision', [body]);
          }
          throw 'blocked';
        }
    }

    function isBlocked(x, y) {
        // TODO extract to world.containsBlock()?
        var rect = body.getRectangle();
        rect.x = x;
        rect.y = y;
        var bodies = world.query(rect);
        var blocks = [];

        // Check if the next tile is blocked.
        for (var i = 0, ii = bodies.length; i < ii; i++) {
          if (bodies[i].getID() !== body.getID() && bodies[i].isBlock()) {
            blocks.push(bodies[i]);
          }
        }

        return blocks;
    }

    function triggerCollisions() {
        var rect = body.getRectangle();
        var bodies = world.query(rect);

        for (var i = 0, ii = bodies.length; i < ii; i++) {
          if (bodies[i].getID() !== body.getID()) {
            // TODO trigger events on body or body.obj?
            bodies[i].events.trigger('player collision', [body]);
          }
        }
    }

    utils.extend(body, {
      setPosition: setPosition,
      isPlayer: true,
    });

    return body;
  }

  // Module exports
  return PlayerBody;

});
