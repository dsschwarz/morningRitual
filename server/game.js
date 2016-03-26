var Deck = require("./deck");
var CardCollection = require("./tileCollection");
var PlayerEngine = require("./playerEngine");
var _ = require("underscore");

function Game(players) {
    var self = this;
    this.deck = new Deck();
    this.openArea = new CardCollection();
    this._playerEngines = {};
    this.players = players;

    _.each(players, function (player) {
        self._playerEngines[player.id] = new PlayerEngine();
    });

    return this;
}

Game.prototype.getPlayer = function (id) {
    return _.findWhere(this.players, {
        id: id
    });
};

Game.prototype.getPlayerEngine = function (player) {
    var playerId = _.isObject(player) ? player.id : player;
    return this._playerEngines[playerId];
};

_.extend(Game.prototype, {
    drawTile: function (playerId) {
        var playerArea = this.getPlayerEngine(playerId);
        if (!playerArea.heldTile) {
            var newTile = this.deck.drawTile();
            playerArea.setHeldTile(newTile);
        }
    },
    placeTile: function (playerId, row, column) {
        var playerArea = this.getPlayerEngine(playerId);
        playerArea.placeTile(row, column);
    },
    discardTile: function (playerId) {
        var playerArea = this.getPlayerEngine(playerId);
        var tile = playerArea.heldTile;
        if (tile.isGoalTile()) {
            // add to goal area
        } else {
            this.openArea.addTile(tile);
        }
        playerArea.setHeldTile(null);
    },
    takeOpenTile: function (playerId, tileId) {
        var playerArea = this.getPlayerEngine(playerId);
        if (this.openArea.containsTile(tileId) && !playerArea.heldTile) {
            var tile = this.openArea.removeTileById(tileId);
            playerArea.setHeldTile(tile);
        }
    }
});

Game.prototype.getGameState = function () {
    var playerTiles = {};
    _.each(this._playerEngines, function (engine) {
        playerTiles[p.id] = engine.getTiles();
    });
    return {
        openArea: this.openArea.getTiles().map(function (c) { return c.toDTO()}),
        playerTiles: playerTiles
    }
};

module.exports = Game;