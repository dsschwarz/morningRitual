var _ = require("underscore");
var _tile = require("./tile");
var tileDefinitions = require("./tileDefinitions");

function Deck() {
    var tiles = [];

    function addTiles() {
        _.each(deckList, function (number, name) {
            for (var i=0; i<number; i++) {
                tiles.push(_tile.createTile(tileDefinitions[name]));
            }
        });

        tiles = _.shuffle(tiles);
    }
    this.drawTile = function () {
        if (tiles.length == 0) {
            addTiles();
        }
        return tiles.pop();
    };
    return this;
}

var deckList = {
    coffee: 8,
    bottle: 2,
    pipe: 3,
    candle: 2,
    fan: 2,
    mousetrap: 1,
    bucket: 1
};

module.exports = Deck;