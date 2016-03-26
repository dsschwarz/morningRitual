define(["states/baseState"], function (baseState) {
    var TakingTile = function (stateManager, tile) {
        this.stateManager = stateManager;
        stateManager.getGame().takeFromOpenArea(tile)
            .then(function (result) {
                if (result) {
                    stateManager.getGame().engine.openArea.removeCard(tile);
                    stateManager.goToState("PlaceCard", tile);
                } else {
                    stateManager.goToState("ChooseAction");
                }
            });
        return this;
    };
    TakingTile.prototype = Object.create(baseState);
    return TakingTile;
});