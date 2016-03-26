define(["baseState", "underscore"], function (baseState, _) {
    var DefaultState = function (stateManager) {
        this.stateManager = stateManager;
        return this;
    };
    DefaultState.prototype = Object.create(baseState, {
        isTileSelectable: function (tile) {
            var tiles = this.stateManager.getGame().engine.getOpenCards();

            return _.some(tiles, function (c) {
                return c.id == tile.id;
            });
        },
        selectTile: function (tile) {
            if (!this.isTileSelectable(tile)) {
                console.warn("Invalid tile")
            } else {
                if (_.contains(this.stateManager.getGame().engine.getOpenCards(), tile)) {
                    this.stateManager.goToState("TakingTile", tile)
                } else {
                    console.warn("Invalid tile");
                }
            }
        },
        selectDeck: function () {
            // draw card state does not exist
            this.stateManager.goToState("DrawingCard");
        }
    });
    return DefaultState;
});