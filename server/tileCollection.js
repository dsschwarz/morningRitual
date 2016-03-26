var _ = require("underscore");

function TileCollection() {
    this._tiles = [];
    return this;
}

TileCollection.prototype.addTile = function (tile) {
    this._tiles.push(tile);
};

TileCollection.prototype.removeTile = function (tile) {
    var index = _.indexOf(this._tiles, tile);
    this._tiles.splice(index, 1);
};

TileCollection.prototype.removeTileById = function (tileId) {
    var index = _.findIndex(this._tiles, function (c) {
        return c.id == tileId;
    });
    var tile = this._tiles[index];
    this._tiles.splice(index, 1);
    return tile;
};

TileCollection.prototype.getTiles = function () {
    return this._tiles;
};

TileCollection.prototype.containsTile = function (tileId) {
    return _.some(this._tiles, function (tile) {
        return tile.id == tileId;
    });
};

module.exports = TileCollection;