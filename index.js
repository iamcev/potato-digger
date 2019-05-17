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
    this.generate = function (rows, cols, start_x, start_y) {
        for (var y = (start_y || 0); y < rows + (start_y || 0); y++) {
            var tr = document.createElement('tr');
            that.el.append(tr);
            for (var x = (start_x || 0); x < cols + (start_x || 0); x++) {
                var td = document.createElement('td');
                td.id = getTileId({x, y});
                td.className = 'game-tile';
                tr.appendChild(td);
            }
        }
    };
    this.initialize = function () {
        that.generate(that.size, that.size);
    }
};

var game = new Game('#game', 10);
game.initialize();