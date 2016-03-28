var _ = require("underscore");
var _tile = require("./tile");
var tileDefinitions = require("./tileDefinitions");

function Deck() {
    var tiles = [];

    /**
     * Add another set of tiles to the deck
     * @private
     */
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

/**
 * The cards to populate the deck with
 * @private
 */
var deckList = {
    coffee: 4,
    bottle: 2,
    pipe: 3,
    candle: 2,
    fan: 2,
    mousetrap: 1,
    bucket: 1
};

module.exports = Deck;