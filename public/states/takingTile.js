define(["states/baseState"], function (baseState) {
    var TakingTile = function (stateManager, promise) {
        promise.then(function (result) {
            if (result) {
                stateManager.handleGameStateChange(result);
                var tile = stateManager.getPlayerTile();
                if (tile.score) {
                    stateManager.goToState("PlacingGoalTile");
                } else {
                    stateManager.goToState("PlacingOrdinaryTile")
                }
            } else {
                console.error("Could not draw card");
                stateManager.goToState("DefaultState");
            }
        });

        return this;
    };
    TakingTile.prototype = Object.create(baseState);
    return TakingTile;
});