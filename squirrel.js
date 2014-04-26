
function SquirrelService(world, container) {
  var texture = PIXI.Texture.fromImage('media/Monster-squirrel.png');

  var textures = [];

  for (var i = 0; i < 8; i++) {
    var x = i * 32;
    var t = new PIXI.Texture(texture, new PIXI.Rectangle(x, 0, 32, 32));
    textures.push(t);
  }


  // http://www.goodboydigital.com/pixijs/docs/files/src_pixi_extras_CustomRenderable.js.html#
  function Renderable(clip, fixture, w, h) {
    PIXI.DisplayObjectContainer.call(this);
    this.renderable = true;
    this.addChild(clip);
    this.fixture = fixture;
    this.clip = clip;
    this.w = w;
    this.h = h;
  }
  Renderable.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
  Renderable.prototype.constructor = Renderable;
  Renderable.prototype.updatePosition = function() {
      var pos = this.fixture.GetBody().GetPosition();
      // TODO need a cleaner way to get position
      var x = world.unscale(pos.get_x());
      var y = world.unscale(pos.get_y());
      this.clip.position.x = x - this.w / 2;
      this.clip.position.y = y - this.h / 2;
  }
  Renderable.prototype._renderCanvas = function(renderer) {
    this.updatePosition();
    PIXI.DisplayObjectContainer.prototype._renderCanvas.call(this, renderer);
  };
  Renderable.prototype._initWebGL = function(renderer) {
    this.updatePosition();
    PIXI.DisplayObjectContainer.prototype._initWebGL.call(this, renderer);
  };
  Renderable.prototype._renderWebGL = function(renderer) {
    this.updatePosition();
    PIXI.DisplayObjectContainer.prototype._renderWebGL.call(this, renderer);
  };

  // TODO sporadic animation. a squirrel isn't a fluid animation loop.
  return {
    create: function(x, y, w, h) {

      var clip = new PIXI.MovieClip(textures);
      clip.animationSpeed = 0.07;
      clip.play();

      clip.position.x = x;
      clip.position.y = y;
      clip.width = w;
      clip.height = h;

      var life = 10;

      var squirrel = {
        hittable: true,
        hit: function(damage) {
          life -= 1;
          console.log('hit', damage, life);

          fixture.GetBody().SetLinearVelocity(new Box2D.b2Vec2(1, 0));

          if (life == 0) {
            world.remove(fixture);
            container.removeChild(renderable);
          }
        },
      };

      var fixture = world.addBox(x, y, w, h, squirrel, {
        mass: 80,
        linearDamping: 0.5,
      });

      var renderable = new Renderable(clip, fixture, w, h);
      container.addChild(renderable);

    },
  };
}
