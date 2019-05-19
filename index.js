function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getTileId(coords) {
    return 't_' + tileIdSign(coords.x) + '_' + tileIdSign(coords.y);
}

function tileIdSign(n) {
    return String(Math.abs(n)) + (n < 0 ? "n" : "");
}

function Game(el, size) {
    var that = this;
    this.el = $(el);
    this.size = size;
    this.tiles = new Map();
    this.generate = function (rows, cols, start_x, start_y) {
        for (var y = (start_y || 0); y < rows + (start_y || 0); y++) {
            var tr = document.createElement('tr');
            that.el.append(tr);
            for (var x = (start_x || 0); x < cols + (start_x || 0); x++) {
                (function () {
                    var td = document.createElement('td');
                    td.id = getTileId({ x, y });
                    td.className = 'game-tile';
                    var d = {};
                    d.x = x;
                    d.y = y;
                    td.addEventListener('click', function () {
                        that.dig(d.x, d.y);
                    });
                    tr.appendChild(td);
                })();
            }
        }
    };
    this.initialize = function () {
        that.generate(that.size, that.size);
    };
    var sums = [ //add to x and y to find adjacent tiles when revealing
        {
            x: -1,
            y: -1
        },
        {
            x: 0,
            y: -1
        },
        {
            x: 1,
            y: -1
        },
        {
            x: -1,
            y: 0
        },
        {
            x: 1,
            y: 0
        },
        {
            x: -1,
            y: 1
        },
        {
            x: 0,
            y: 1
        },
        {
            x: 1,
            y: 1
        }
    ];
    this.reveal = function (tile) {
        var $td = $('#' + getTileId(tile));
        var ducks = 0;

        if (tile.isDuck) {
            $td.text('duck.');
        } else {
            sums.forEach(function (sum) {
                var foundTile = that.tiles.get(getTileId({
                    x: tile.x + sum.x,
                    y: tile.y + sum.y
                }));
                if (foundTile) {
                    if (foundTile.isDuck) {
                        ducks++;
                    }
                }
            });

            $td.text(ducks);
        }
    };
    this.plantDucks = function (exclude) {
        for (var i = 0; i < Math.ceil(that.size * that.size / 7); i++) {
            var x = getRandomInt(0, that.size - 1);
            var y = getRandomInt(0, that.size - 1);
            while ({ x, y } == exclude) {
                x = getRandomInt(0, that.size - 1);
                y = getRandomInt(0, that.size - 1);
            }
            var tile = new Tile(x, y, true);
            tile.pushToGame(that);
        }
    };
    this.dig = function (x, y) {
        var tile = that.tiles.get(getTileId({ x, y }));
        if (!tile) {
            tile = new Tile(x, y, false);
        }
        tile.pushToGame(that);
        that.reveal(tile);
    };
};

function Tile(x, y, is_duck) {
    var that = this;
    this.x = x;
    this.y = y;
    this.isDuck = is_duck;
    this.pushToGame = function (game) {
        game.tiles.set(getTileId(that), that);
    };
}

var game = new Game('#game', 10);
game.initialize();