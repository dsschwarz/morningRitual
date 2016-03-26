define([
    "gameRenderer", "stateManager", "game", "gameNetworkingService"
], function (GameRenderer, StateManager, Game, Networking) {
    $(document).ready(function () {
        var gameNetworkingService = new Networking();
        gameNetworkingService.getGameState().then(function (newState) {
            var game = new Game(newState);
            var stateManager = new StateManager(game, gameNetworkingService);
            var renderer = new GameRenderer(stateManager);
        }, function (error) {
            console.error(error);
        })
    });
});