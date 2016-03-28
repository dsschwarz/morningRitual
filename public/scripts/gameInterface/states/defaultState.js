define(["gameInterface/states/baseState", "underscore"], function (baseState, _) {
    var DefaultState = function (stateManager) {
        this.stateManager = stateManager;
        return this;
    };
    DefaultState.prototype = Object.create(baseState);
    _.extend(DefaultState.prototype, {
        isTileSelectable: function (tile) {
            var openTiles = this.stateManager.getGame().getOpenTiles();
            var goalTiles = this.stateManager.getGame().getGoalTiles();

            var allTiles = openTiles.concat(goalTiles);
            return _.some(allTiles, function (c) {
                return c.id == tile.id;
            });
        },
        selectTile: function (tile) {
            if (!this.isTileSelectable(tile)) {
                console.warn("Invalid tile")
            } else {
                if (_.contains(this.stateManager.getGame().getOpenTiles(), tile)) {
                    this.stateManager.goToState("TakingTile", this.stateManager.networking.takeFromOpenArea(tile))
                } else if (_.contains(this.stateManager.getGame().getGoalTiles(), tile)) {
                    this.stateManager.goToState("TakingTile", this.stateManager.networking.takeFromGoalArea(tile))
                } else {
                    console.warn("Invalid tile");
                }
            }
        },
        selectDeck: function () {
            this.stateManager.goToState("TakingTile", this.stateManager.networking.drawTile());
        }
    });
    return DefaultState;
});