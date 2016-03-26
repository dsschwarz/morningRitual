define(["lib/d3", "states/allStates"], function (d3, allStates) {
    function StateManager(game, gameNetworkingService) {
        var that;
        this.game = game;
        this.networking = gameNetworkingService;
        this.networking.onGameStateChange(function updateGame(newState) {
            that.game.updateState(newState);
        });
        return this;
    }

    StateManager.prototype.goToState = function (name) {
        d3.select(".preview").remove(); // clear all previews
        this.currentState = allStates[name].apply(null, Array.prototype.slice.call(arguments, 1));
        this.render();
    };

    StateManager.prototype.getState = function () {
        return this.currentState;
    };

    StateManager.prototype.getGame = function () {
        return this.game;
    };

    StateManager.prototype.getPlayerTile = function () {
        return this.game.getPlayerEngine().heldTile;
    };

    StateManager.prototype.getCurrentPlayerId = function () {
        return this.networking.player;
    };

    return StateManager;
});
