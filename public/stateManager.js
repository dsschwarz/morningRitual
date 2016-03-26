define(["d3"], function (d3) {
    function StateManager(game, gameNetworkingService) {
        this.game = game;
        this.networking = gameNetworkingService;
        return this;
    }

    StateManager.prototype.goToState = function (name) {
        d3.select(".preview").remove(); // clear all previews
        this.currentState = states[name].apply(null, Array.prototype.slice.call(arguments, 1));
        this.render();
    };

    StateManager.prototype.getState = function () {
        return this.currentState;
    };

    StateManager.prototype.getGame = function () {
        return this.game;
    };

    StateManager.prototype.getPlayerTile = function () {
        return this.game.getPlayerEngine().currentTile;
    };

    StateManager.prototype.getCurrentPlayerId = function () {
        return this.networking.player;
    };

    return StateManager;
});
