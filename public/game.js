define(["playerArea"], function (PlayerArea) {
    function Game(gameState) {
        var self = this;
        this.openArea = new CardCollection();
        this._playerAreas = {};
    
        _.each(gameState.playerAreas, function (state, playerId) {
            self._playerAreas[playerId] = new PlayerArea(state);
        });
    
        return this;
    }

    Game.prototype.showMachine = function(person) {
        // currentPlayer = person;
    };

    Game.prototype.showingMyArea = function () {
        return true;
        // return !!(player && currentPlayer.id == player.id);
    };

    Game.prototype.getPlayerArea = function (player) {
        return this._playerAreas[player.id];
    };

    /**
     * Returns an array of the open cards.
     */
    Game.prototype.getOpenCards = function () {
        return this.openArea.getCards();
    };
    
    return Game;
});