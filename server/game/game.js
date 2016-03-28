var Deck = require("./deck");
var TileCollection = require("./tileCollection");
var PlayerArea = require("./playerArea");
var _ = require("underscore");
var uniqueIds = require("../uniqueIds");
var assert = require("assert");
var _tile = require("./tile");
var tileDefinitions = require("./tileDefinitions");

/**
 * The initial tile ids, and their amount
 * that will populate the 'goal' area
 * @private
 */
var initialGoalTiles = {
    mug: 4,
    coffeeMachine: 2,
    espressoMachine: 1
};

/**
 * A representation of a game in progress
 * @param players {User[]}
 * @returns {Game}
 * @constructor
 */
function Game(players) {
    var self = this;
    this.id = uniqueIds.getId();
    this.deck = new Deck();
    this.openArea = new TileCollection();
    this.goalArea = new TileCollection();
    this._playerAreas = {};
    this.players = players;

    _.each(initialGoalTiles, function (number, name) {
        for (var i=0; i<number; i++) {
            self.goalArea.addTile(_tile.createTile(tileDefinitions[name]));
        }
    });

    _.each(players, function (player) {
        player.disconnected = true;
        self._playerAreas[player.id] = new PlayerArea(player.id);
    });

    return this;
}

Game.prototype.getPlayer = function (id) {
    return _.findWhere(this.players, {
        id: id
    });
};

/**
 * Get the area for a given player/playerId
 * @param player {User|String} User object or user id
 * @returns {PlayerArea}
 * @private
 */
Game.prototype._getPlayerArea = function (player) {
    var playerId = _.isObject(player) ? player.id : player;
    return this._playerAreas[playerId];
};

Game.prototype.drawTile = function (playerId) {
    var playerArea = this._getPlayerArea(playerId);
    if (!playerArea.heldTile) {
        var newTile = this.deck.drawTile();
        playerArea.setHeldTile(newTile);
    } else {
        throw new Error("Already holding tile")
    }
};

Game.prototype.placeTile = function (playerId, row, column) {
    var playerArea = this._getPlayerArea(playerId);
    playerArea.placeTile(row, column);
};

Game.prototype.discardTile = function (playerId) {
    var playerArea = this._getPlayerArea(playerId);
    var tile = playerArea.heldTile;
    if (tile.isGoalTile()) {
        this.goalArea.addTile(tile);
    } else {
        this.openArea.addTile(tile);
    }
    playerArea.setHeldTile(null);
};

/**
 * Helper method for removing a tile by id from a given area
 * @param playerId {String}
 * @param tileId {Number}
 * @param area {TileCollection}
 * @private
 */
Game.prototype._takeTileFromArea = function (playerId, tileId, area) {
    var playerArea = this._getPlayerArea(playerId);
    assert(area.containsTile(tileId), "Tile is not available");
    assert(!playerArea.heldTile, "Player is holding a tile");
    var tile = area.removeTileById(tileId);
    playerArea.setHeldTile(tile);
};

Game.prototype.takeOpenTile = function (playerId, tileId) {
    this._takeTileFromArea(playerId, tileId, this.openArea);
};

Game.prototype.takeGoalTile = function (playerId, tileId) {
    this._takeTileFromArea(playerId, tileId, this.goalArea);
};

Game.prototype.getState = function () {
    var playerAreas = {};
    _.each(this._playerAreas, function (engine) {
        playerAreas[engine.playerId] = {
            tiles: engine.getTiles().map(function (tile) { return tile.toDTO()}),
            heldTile: engine.heldTile ? engine.heldTile.toDTO() : null
        }
    });
    return {
        openTiles: this.openArea.getTileDTOs(),
        goalTiles: this.goalArea.getTileDTOs(),
        playerAreas: playerAreas,
        players: this.players
    }
};

module.exports = Game;