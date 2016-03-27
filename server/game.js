var Deck = require("./deck");
var TileCollection = require("./tileCollection");
var PlayerArea = require("./playerArea");
var _ = require("underscore");
var uniqueIds = require("../uniqueIds");

/**
 * 
 * @param players
 * @returns {Game}
 * @constructor
 */
function Game(players) {
    var self = this;
    this.id = uniqueIds.getId();
    this.deck = new Deck();
    this.openArea = new TileCollection();
    this._playerAreas = {};
    this.players = players;

    _.each(players, function (player) {
        self._playerAreas[player.id] = new PlayerArea(player.id);
    });

    return this;
}

Game.prototype.getPlayer = function (id) {
    return _.findWhere(this.players, {
        id: id
    });
};

Game.prototype.getPlayerArea = function (player) {
    var playerId = _.isObject(player) ? player.id : player;
    return this._playerAreas[playerId];
};

_.extend(Game.prototype, {
    drawTile: function (playerId) {
        var playerArea = this.getPlayerArea(playerId);
        if (!playerArea.heldTile) {
            var newTile = this.deck.drawTile();
            playerArea.setHeldTile(newTile);
        } else {
            throw new Error("Already holding tile")
        }
    },
    placeTile: function (playerId, row, column) {
        var playerArea = this.getPlayerArea(playerId);
        playerArea.placeTile(row, column);
    },
    discardTile: function (playerId) {
        var playerArea = this.getPlayerArea(playerId);
        var tile = playerArea.heldTile;
        if (tile.isGoalTile()) {
            // add to goal area
        } else {
            this.openArea.addTile(tile);
        }
        playerArea.setHeldTile(null);
    },
    takeOpenTile: function (playerId, tileId) {
        var playerArea = this.getPlayerArea(playerId);
        if (this.openArea.containsTile(tileId) && !playerArea.heldTile) {
            var tile = this.openArea.removeTileById(tileId);
            playerArea.setHeldTile(tile);
        }
    }
});

Game.prototype.getGameState = function () {
    var playerAreas = {};
    _.each(this._playerAreas, function (engine) {
        playerAreas[engine.playerId] = {
            tiles: engine.getTiles().map(function (tile) { return tile.toDTO()}),
            heldTile: engine.heldTile ? engine.heldTile.toDTO() : null
        }
    });
    return {
        openTiles: this.openArea.getTiles().map(function (tile) { return tile.toDTO()}),
        playerAreas: playerAreas
    }
};

module.exports = Game;