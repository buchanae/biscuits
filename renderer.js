

var sprites = {};

function Tile(row, column, value) {
  this.row = row;
  this.column = column;
  this.value = value;
  this.block = false;
}

function Grid(numRows, numColumns, Tile) {
  this.numRows = numRows;
  this.numColumns = numColumns;
  this.Tile = Tile;
  this._items = [];

  for (var row_i = 0; row_i < numRows; row_i++) {
    for (var col_i = 0; col_i < numColumns; col_i++) {
      this.setTile(row_i, col_i, undefined);
    }
  }
}

Grid.prototype = {
  forEach: function(callback) {
    for (var i = 0, ii = this.numRows; i < ii; i++) {
      for (var j = 0, jj = this.numColumns; j < jj; j++) {
        var idx = i * this.numColumns + j;
        callback(this._items[idx]);
      }
    }
  },

  getTile: function(row, column) {
    var idx = row * this.numColumns + column;
    return this._items[idx];
  },

  setTile: function(row, column, value) {
    var idx = row * this.numColumns + column;
    this._items[idx] = new this.Tile(row, column, value);
  },
};


function SpriteTileRenderer(grid, sprites, tileHeight, tileWidth) {
  this.grid = grid;
  this.tileHeight = tileHeight;
  this.tileWidth = tileWidth;
}

SpriteTileRenderer.prototype = {
  render: function(ctx) {
    this.grid.forEach(function(tile) {
      var x = tile.column * this.tileWidth;
      var y = tile.row * this.tileHeight;
      ctx.fillStyle = tile.value;
      ctx.fillRect(x, y, this.tileWidth, this.tileHeight)
    });
  },
};


function PlayerRenderer(player, tileHeight, tileWidth) {
  this.tileHeight = tileHeight;
  this.tileWidth = tileWidth;
  this.player = player;
}

PlayerRenderer.prototype = {
  render: function(ctx) {
    var x = this.player.position.column * this.tileWidth;
    var y = this.player.position.row * this.tileHeight;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(x, y, this.tileWidth, this.tileHeight);
  },
};


function startBiscuits(canvas) {

  var grid = new Grid(20, 20, Tile);

  grid.forEach(function(tile) {
    if (tile.row == 0 || tile.column == 0) {
      tile.value = 'black';
      tile.block = true;
    } else {
      tile.value = 'gray';
    }
  });

  tileWidth = canvas.width / grid.numColumns;
  tileHeight = canvas.height / grid.numRows;
  
  var ctx = canvas.getContext('2d');

  var player = {
    position: {row: 2, column: 1},
  };

  var renderers = [
    new SpriteTileRenderer(grid, sprites, tileWidth, tileHeight),
    new PlayerRenderer(player, tileWidth, tileHeight),
  ];


  var keybindings = new KeyBindings(document);
  var movementHandler = new MovementHandler(keybindings, player, grid);

  function masterRender() {
    for (var i = 0, ii = renderers.length; i < ii; i++) {
      ctx.save();
      renderers[i].render(ctx);
      ctx.restore();
    }
    requestAnimationFrame(masterRender);
  }

  requestAnimationFrame(masterRender);
}

function MovementHandler(keybindings, player, grid) {

  function move(rowDelta, columnDelta) {
    var nextRow = player.position.row + rowDelta;
    var nextCol = player.position.column + columnDelta;

    var nextTile = grid.getTile(nextRow, nextCol);

    if (!nextTile.block) {
      player.position.row = nextRow;
      player.position.column = nextCol;
    }
  }

  function makeCallback(rowDelta, columnDelta) {
    return function() {
      move(rowDelta, columnDelta);
    }
  }

  keybindings.on('UP', makeCallback(-1, 0));
  keybindings.on('DOWN', makeCallback(1, 0));
  keybindings.on('LEFT', makeCallback(0, -1));
  keybindings.on('RIGHT', makeCallback(0, 1));
}

function KeyBindings(document) {

  var keybindings = this;

  document.addEventListener('keypress', function(event) {

    var keyCodeMap = {
      38: 'UP',
      40: 'DOWN',
      37: 'LEFT',
      39: 'RIGHT',
    };

    var eventName = keyCodeMap[event.keyCode];
    if (eventName) {
      keybindings._fire(eventName);
      event.preventDefault();
    }

  }, true);

  this.listeners = {};
}

KeyBindings.prototype = {
  _fire: function(name) {
    var listeners = this.listeners[name] || [];
    for (var i = 0, ii = listeners.length; i < ii; i++) {
      listeners[i]();
    }
  },
  on: function(name, callback) {
    var listeners = this.listeners[name];

    if (!listeners) {
      var listeners = [];
      this.listeners[name] = listeners;
    }

    this.listeners[name].push(callback);
  },
};
