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
                var td = document.createElement('td');
                td.id = getTileId({ x, y });
                td.className = 'game-tile';
                tr.appendChild(td);
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
        var gophers = 0;

        if (tile.isGopher) {
            $td.text('gopher.');
        } else {
            sums.forEach(function (sum) {
                var foundTile = that.tiles.get(getTileId({
                    x: tile.x + sum.x,
                    y: tile.y + sum.y
                }));
                if (foundTile) {
                    if (foundTile.isGopher) {
                        gophers++;
                    }
                }
            });

            $td.text(gophers);
        }
    };
};

function Tile (x, y, is_gopher) {
    var that = this;
    this.x = x;
    this.y = y;
    this.isGopher = is_gopher;
    this.pushToGame = function (game) {
        game.tiles.set(getTileId(that), that);
    };
}

var game = new Game('#game', 10);
game.initialize();