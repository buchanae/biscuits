function World(gridWidth, gridHeight) {

  var currentObjectID = 0;

  var grid = [];
  for (var x = 0; x < gridWidth; x++) {
    var row = [];
    grid.push(row);
    for (var y = 0; y < gridHeight; y++) {
      row.push([]);
    }
  }

  function query(x, y, w, h) {
    var hits = {};

    for (var ix = x; ix < x + w; ix++) {
      for (var iy = y; iy < y + h; iy++) {
        var cell = grid[ix][iy];
        for (var i = 0; i < cell.length; i++) {
          var o = cell[i];
          hits[o.getID()] = o;
        }
      }
    }

    var objects = [];
    for (var k in hits) {
      objects.push(hits[k]);
    }

    return objects;
  }

  return {
    query: query,

    queryMany: function(rects) {
      var hits = {};

      for (var ri = 0; ri < rects.length; ri++) {
        var rect = rects[ri];
        var x = rect[0];
        var y = rect[1];
        var w = rect[2];
        var h = rect[3];

        for (var ix = x; ix < x + w; ix++) {
          for (var iy = y; iy < y + h; iy++) {
            var cell = grid[ix][iy];
            for (var i = 0; i < cell.length; i++) {
              var o = cell[i];
              hits[o.getID()] = o;
            }
          }
        }
      }

      var objects = [];
      for (var k in hits) {
        objects.push(hits[k]);
      }

      return objects;
    },

    findPath: function(x1, y1, x2, y2) {
      // TODO this is obviously grossly inefficient and should be optimized
      var pfGrid = new PF.Grid(gridWidth, gridHeight);

      for (var x = 0; x < gridWidth; x++) {
        for (var y = 0; y < gridHeight; y++) {
          var cell = grid[x][y];
          var walkable = true;
          for (var i = 0; i < cell.length; i++) {
            if (cell[i].isBlock) {
              walkable = false;
            }
          }
          pfGrid.setWalkableAt(x, y, walkable);
        }
      }

      var finder = new PF.AStarFinder();
      var path = finder.findPath(x1, y1, x2, y2, pfGrid);
      return path;
    },

    add: function(x, y, w, h) {

      var currentX, currentY;
      var ID = currentObjectID++;

      function remove() {

        for (var ix = currentX; ix < currentX + w; ix++) {
          for (var iy = currentY; iy < currentY + h; iy++) {
            var cell = grid[ix][iy];
            var i = cell.indexOf(obj);
            if (i != -1) {
              cell.splice(i, 1);
            }
          }
        }
      }

      function setCells(x, y) {
        remove();

        for (var ix = x; ix < x + w; ix++) {
          for (var iy = y; iy < y + h; iy++) {
            var cell = grid[ix][iy];
            cell.push(obj);
          }
        }

        currentX = x;
        currentY = y;

        var collisions = query(x, y, w, h);

        for (var i = 0, ii = collisions.length; i < ii; i++) {
          var collision = collisions[i];
          if (obj.onCollision && collision !== obj) {
            obj.onCollision(collision);
          }
          else if (collision.onCollision) {
            collision.onCollision(obj);
          }
        }
      }

      var obj = {
        getID: function() {
          return ID;
        },
        getPosition: function() {
          return {x: currentX, y: currentY};
        },
        setPosition: function(x, y) {
          setCells(x, y);
        },
        remove: remove,
      };

      setCells(x, y);

      return obj;
    },
  };
}
