requirejs([
    "gameRenderer", "states/stateManager", "networking/gameNetworkingService"
], function (GameRenderer, StateManager, Networking) {
    $(document).ready(function () {
        var gameNetworkingService = new Networking();
        gameNetworkingService.getGameState().then(function (newState) {
            var stateManager = new StateManager(newState, gameNetworkingService);
            var renderer = new GameRenderer(stateManager);
        }, function (error) {
            console.error(error);
        })
    });
});