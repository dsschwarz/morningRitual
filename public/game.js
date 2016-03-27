define(["playerArea", "underscore"], function (PlayerArea, _) {
    function Game(gameState) {
        var self = this;
        this.openTiles = gameState.openTiles;
        this._playerAreas = {};
    
        _.each(gameState.playerAreas, function (state, playerId) {
            self._playerAreas[playerId] = new PlayerArea(state);
        });
    
        return this;
    }

    Game.prototype.getOpenTiles = function() {
        return this.openTiles;
    };

    Game.prototype.getGoalTiles = function() {
        return [];
    };

    Game.prototype.showMachine = function(person) {
        // currentPlayer = person;
    };

    Game.prototype.showingMyArea = function () {
        return true;
        // return !!(player && currentPlayer.id == player.id);
    };

    Game.prototype.getPlayerArea = function (player) {
        var playerId = _.isObject(player) ? player.id : player;
        return this._playerAreas[playerId];
    };

    /**
     * Returns an array of the open cards.
     */
    Game.prototype.getOpenCards = function () {
        return this.openTiles;
    };
    
    return Game;
});