define([], function () {
    function PlayerArea(state) {
        this._tiles = state.tiles;
        this.heldTile = state.heldTile;
        return this;
    }

    var pEngineProto = PlayerArea.prototype;
    pEngineProto.canPlaceTile = function(tile, row, column) {
        var existingTile = this.getTile(row, column);

        var neighbouringTile =
            this._tiles.length == 0 ||
            this.getTile(row - 1, column) ||
            this.getTile(row + 1, column) ||
            this.getTile(row, column - 1) ||
            this.getTile(row, column + 1);

        return !existingTile && neighbouringTile;
    };

    pEngineProto.getTile = function (row, column) {
        return _.findWhere(this._tiles, {
            row: row,
            column: column
        });
    };

    pEngineProto.getTiles = function () {
        return this._tiles;
    };
    return PlayerArea;
});