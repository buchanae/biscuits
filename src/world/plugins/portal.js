define(['WorldLoader'], function(WorldLoader, sceneManager) {

  // TODO player jumps through portal with the slightest overlap.
  //      would be nicer to wait until the player is overlapping more
  //      so it feels like you're *in* the portal

  // TODO use requirejs to define handlers?
  //      2. it allows the scene loader to do dependency configuration
  //         on a per-scene basis, which could be a cool way of injecting
  //         dependencies like world, player, and renderer. sort of like
  //         how $scope is injected on a per-view basis?

  WorldLoader.events.addListener('load portal', function(obj, world, container, player) {
    var worldObj = world.add(obj.x, obj.y, obj.w, obj.h);

    var g = new PIXI.Graphics();
    g.beginFill(0x00ffaa);
    g.drawRect(obj.x, obj.y, obj.w, obj.h);
    g.endFill();
    container.addChild(g);

    worldObj.events.on('player collision', function(player) {
      sceneManager.load(obj.portalDestination);
    });
  });
});