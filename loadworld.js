
function loadWorld(mapfile, sceneManager, container) {

  var reqs = [
    Player(),
    SquirrelService(),
    loadMap(mapfile),
  ];

  return Q.spread(reqs, function(player, Squirrel, map) {

    // TODO maybe loadpoint from Tiled should determine layer?
    //var squirrel = Squirrel.create();
    var keybindings = KeyBindingsService(document);

    var world = World();
    var scale = 32;

    var playerX = 100;
    var playerY = 100;
    var playerW = 32;
    var playerH = 32;

    var body = world.addDynamic(player, playerX / scale, playerY / scale, playerW / scale, playerH / scale);
    body.SetLinearDamping(2);
    console.log(playerX / scale);

    var movement = MovementHandler(body, {
      onStart: function(direction) {
        player.direction = direction;
      },
    });

    //var view = new WorldView(world, 20, 20);

    // Portal handling
    world.contactListener(function(fixtureA, fixtureB) {
        if (fixtureA.objectData.portal && fixtureB.objectData === player) {
          sceneManager.load(fixtureA.objectData.portal);
        }
        else if (fixtureB.objectData.portal && fixtureA.objectData === player) {
          sceneManager.load(fixtureB.objectData.portal);
        }
    });


    function makeScene(playerX, playerY, viewX, viewY) {
        return function() {
            world.start();
            container.visible = true;

            // TODO view.position.set(viewX, viewY);

            // TODO not only set position, but direction
            playerSprite.position.x = playerX;
            playerSprite.position.y = playerY;

            var x = (playerX / scale) + (playerW / scale / 2);
            var y = (playerY / scale) + (playerH / scale / 2);

            body.SetTransform(new Box2D.b2Vec2(x, y), body.GetAngle());

            sceneManager.render = function() {
              var pos = body.GetPosition();

              playerSprite.position.x = (pos.get_x() * scale) - (playerW / 2);
              playerSprite.position.y = (pos.get_y() * scale) - (playerH / 2)
            }

            var deregisterKeybindings = keybindings.listen(function(name) {
              movement[name]();
            });

            // return unload function
            return function() {
              world.stop();
              container.visible = false;
              deregisterKeybindings();
            }
        }
    }

    // TODO do i really want these split? probably not
    for (var layer_i = 0; layer_i < map.tilelayers.length; layer_i++) {
      for (var obj_i = 0; obj_i < map.tilelayers[layer_i].length; obj_i++) {
        var obj = map.tilelayers[layer_i][obj_i];
        container.addChild(obj);
      }
    }



    for (var layer_i = 0; layer_i < map.objectlayers.length; layer_i++) {
      for (var obj_i = 0; obj_i < map.objectlayers[layer_i].length; obj_i++) {
        var obj = map.objectlayers[layer_i][obj_i];

        if (obj.isBlock) {

          var g = new PIXI.Graphics();
          g.beginFill(0x000000);
          g.drawRect(obj.x, obj.y, obj.w, obj.h);
          g.endFill();
          container.addChild(g);

          world.addStatic(obj, obj.x / scale, obj.y / scale, obj.w / scale, obj.h / scale);
        }

        else if (obj.portal) {

          var g = new PIXI.Graphics();
          g.beginFill(0x00ffaa);
          g.drawRect(obj.x, obj.y, obj.w, obj.h);
          g.endFill();
          container.addChild(g);

          var fixture = world.addStatic(obj, obj.x / scale, obj.y / scale, obj.w / scale, obj.h / scale);
          fixture.SetSensor(true);
        }

        else if (obj.type == 'loadpoint') {
          // TODO better default than 0, like center player in view
          var viewX = obj.viewX || 0;
          var viewY = obj.viewY || 0;
          var load = makeScene(obj.x, obj.y, viewX, viewY);

          g.beginFill(0xdddddd);
          g.drawRect(obj.x, obj.y, obj.w, obj.h);
          g.endFill();
          container.addChild(g);
          console.log(obj.x);

          sceneManager.addScene(obj.name, load);
        }
      }
    }

    var playerSprite = player.sprites.down;
    container.addChild(playerSprite);

  });
}

            /*


          } else {
              //var pos = new Position(obj.x, obj.y)

              if (obj.portal) {
              }


              if (obj.type == 'squirrel') {

                  obj.render = squirrel.render.bind(squirrel);
                  obj.isBlock = true;
              }

          }
              */
