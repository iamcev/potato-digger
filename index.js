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
    this.gameOver = false;
    this.duckCount = Math.ceil(this.size * this.size / 7);
    this.availableFlags = this.duckCount;
    this.time = 0;
    this.generate = function (rows, cols, start_x, start_y) {
        for (var y = (start_y || 0); y < rows + (start_y || 0); y++) {
            var tr = document.createElement('tr');
            that.el.append(tr);
            for (var x = (start_x || 0); x < cols + (start_x || 0); x++) {
                (function () {
                    var td = document.createElement('td');
                    td.id = getTileId({ x, y });
                    td.className = 'game-tile unrevealed';
                    var d = {};
                    d.x = x;
                    d.y = y;
                    td.onclick = function (e) {
                        e.preventDefault();
                        if (!that.el.hasClass('dirty')) {
                            that.plantDucks({ x: d.x, y: d.y });
                            var startTime = new Date().getTime();
                            that.interval = setInterval(function () {
                                var currentTime = new Date().getTime();
                                that.time = Math.floor((currentTime - startTime) / 1000);
                                if (that.time > 999)
                                    that.time = 999;
                                that.infoEl.innerText = '🚩×' + that.availableFlags + ' :::: 🕙' + that.time.toString().padStart(3, '0');
                            });
                        }
                        that.dig(d.x, d.y);
                        that.el.addClass('dirty');
                    };
                    td.oncontextmenu = function (e) {
                        that.mark(d.x, d.y);
                        return false;
                    };
                    tr.appendChild(td);
                })();
            }
        }
    };
    this.initialize = function () {
        that.el.html('');
        that.infoEl = document.createElement('div');
        that.infoEl.innerText = '🚩×' + that.availableFlags + ' :::: 🕙' + that.time.toString().padStart(3, '0');
        that.el.append(that.infoEl);
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
        $td.text('');

        if (tile.isMarked) {
            $td.text('🚩');
        } else if (tile.isVisible) {
            if (tile.isDuck) {
                $td.text('🦆');
                $td.removeClass('unrevealed');
                if (that.gameOver == false) {
                    that.gameOver = true;
                    that.tiles.forEach(function (tile) {
                        if (tile.isDuck) {
                            tile.isVisible = true;
                            that.reveal(tile);
                        }
                    });
                    clearInterval(that.interval);
                    setTimeout(function () {
                        document.body.innerHTML = 'YOU DIED!!!! 🦆';
                    }, 1500);
                }
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
                $td.addClass('color-' + ducks);
                $td.text(ducks);
                if (ducks === 0) {
                    $td.text('');
                }
                $td.removeClass('unrevealed');
                if (!tile.isRevealed) {
                    tile.isRevealed = true;
                    if (that.tiles.size >= that.size * that.size) {
                        clearInterval(that.interval);
                        that.infoEl.innerText = 'YOU WIN! 🕙' + that.time.toString().padStart(3, '0');
                        document.body.onclick = () => { };
                    }
                }
                /*if (ducks === 0) {
                    sums.forEach(function (sum) {
                        var tileDucks = 0;
                        var newCoords = {
                            x: tile.x + sum.x,
                            y: tile.y + sum.y
                        };
                        var foundTile = that.tiles.get(getTileId(newCoords));
                        if (foundTile)
                            return;
                        if (newCoords.x > that.size - 1 || newCoords.x < 0)
                            return;
                        if (newCoords.y > that.size - 1 || newCoords.y < 0)
                            return;
                        foundTile = new Tile(newCoords.x, newCoords.y, false);
                        sums.forEach(function (sum) {
                            var found = that.tiles.get(getTileId({
                                x: newCoords.x + sum.x,
                                y: newCoords.y + sum.y
                            }));
                            if (found) {
                                if (found.isDuck) {
                                    tileDucks++;
                                }
                            }
                        });
                        if (tileDucks > 0)
                            return;
                        foundTile.isVisible = true;
                        that.reveal(foundTile);
                    });
                }*/
            }
        } else if (!tile.isVisible) {
            $td.addClass('unrevealed');
            $td.text('');
        }

        return ducks;
    };
    this.plantDucks = function (exclude) {
        while (that.tiles.size < that.duckCount) {
            var x = getRandomInt(0, that.size - 1);
            var y = getRandomInt(0, that.size - 1);
            while (exclude.x == x && exclude.y == y) {
                x = getRandomInt(0, that.size - 1);
                y = getRandomInt(0, that.size - 1);
            }
            var tile = new Tile(x, y, true);
            tile.pushToGame(that);
        }
    };

    function loopSurroundingTiles(tile) {
        var isSafe = true;
        sums.forEach(function (sum) {
            var newCoords = {
                x: tile.x + sum.x,
                y: tile.y + sum.y
            };
            if (newCoords.x > that.size - 1 || newCoords.x < 0)
                return;
            if (newCoords.y > that.size - 1 || newCoords.y < 0)
                return;
            var foundTile = that.tiles.get(getTileId(newCoords));
            if (foundTile) {
                if (foundTile.isMarked) {
                    return;
                }
                if (foundTile.isDuck) {
                    isSafe = false;
                }
            }
        });
        if (isSafe) {
            sums.forEach(function (sum, index) {
                var newCoords = {
                    x: tile.x + sum.x,
                    y: tile.y + sum.y
                };
                if (newCoords.x > that.size - 1 || newCoords.x < 0)
                    return;
                if (newCoords.y > that.size - 1 || newCoords.y < 0)
                    return;
                var foundTile = that.tiles.get(getTileId(newCoords));
                if (!foundTile) {
                    foundTile = new Tile(tile.x + sum.x, tile.y + sum.y, false);
                    foundTile.isVisible = true;
                    foundTile.pushToGame(that);
                }
                if (foundTile.isMarked) {
                    return;
                }
                foundTile.isVisible = true;
                that.reveal(foundTile);
            });
        }
    }

    this.dig = function (x, y) {
        var tile = that.tiles.get(getTileId({ x, y }));
        if (!tile) {
            tile = new Tile(x, y, false);
            tile.pushToGame(that);
        }
        if (tile.isVisible)
            loopSurroundingTiles(tile);
        tile.isVisible = true;
        if (that.reveal(tile) === 0 && !tile.isMarked && !tile.isDuck) 
            loopSurroundingTiles(tile);
    };
    this.mark = function (x, y) {
        var tile = that.tiles.get(getTileId({ x, y }));
        if (!tile) {
            tile = new Tile(x, y, false);
        }
        if (!tile.isVisible) {
            if (tile.isMarked) {
                tile.isMarked = false;
                that.availableFlags++;
                that.infoEl.innerText = '🚩×' + that.availableFlags + ' :::: 🕙' + that.time.toString().padStart(3, '0');
            } else {
                if (that.availableFlags > 0) {
                    tile.isMarked = true;
                    that.availableFlags--;
                    that.infoEl.innerText = '🚩×' + that.availableFlags + ' :::: 🕙' + that.time.toString().padStart(3, '0');
                }
            }
            tile.pushToGame(that);
            that.reveal(tile);
        }
    }
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

var game = new Game('#game', 15);
game.initialize();

var sizeInput = $('#size');
var generateButton = $('#generate');
generateButton.click(function () {
    game = new Game('#game', Number(sizeInput.val()));
    game.initialize();
});