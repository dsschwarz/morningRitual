var _ = require("underscore");
var _tile = require("./tile");

function PlayerEngine() {
    this._items = [];
    this.heldTile = null;
    return this;
}

var pEngineProto = PlayerEngine.prototype;
pEngineProto.canPlaceTile = function(row, column) {
    var existingTile = this.getTile(row, column);

    var neighbouringTile =
        this._items.length == 0 ||
        this.getTile(row - 1, column) ||
        this.getTile(row + 1, column) ||
        this.getTile(row, column - 1) ||
        this.getTile(row, column + 1);

    return !!this.heldTile && !existingTile && neighbouringTile;
};

pEngineProto.addTileToMachine = function (row, column) {
    if (this.canPlaceTile(row, column)) {
        var placedTile = _tile.placeTile(this.heldTile, row, column);
        this._items.push(placedTile);
        this.heldTile = null;
    } else {
        throw new Error("Cannot place tile at given location");
    }
};

pEngineProto.setHeldTile = function (tile) {
    if (!!this.heldTile) {
        throw new Error("Already holding tile");
    }
    
    this.heldTile = tile;
};

pEngineProto.getTile = function (row, column) {
    return _.findWhere(this._items, {
        row: row,
        column: column
    });
};

pEngineProto.getTiles = function () {
    return this._items;
};

module.exports = PlayerEngine;