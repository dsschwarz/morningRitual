define(["states/baseState", "underscore"], function (baseState, _) {
    /**
     * Consider this the js equivalent of a private, abstract base class
     * {PlacingTile}
     */
    var placingTileMethods = _.extend(Object.create(baseState), {
        playerAreaIsSelectable: true,
        selectPlayerArea: function (row, column) {
            var game = this.stateManager.getGame();
            var playerArea = game.getPlayerArea(this.stateManager.getCurrentPlayerId());
            if (playerArea.canPlaceTile(this.stateManager.getPlayerTile(), row, column)) {
                this.stateManager.networking.placeTile(row, column);
                this.stateManager.goToState("DefaultState");
            } else {
                throw new Error("Invalid location")
            }
        },
        cancel: function () {
            this.stateManager.networking.discardTile();
            this.stateManager.goToState("DefaultState");
        }
    });
    var PlacingOrdinaryTile = function (stateManager) {
        this.stateManager = stateManager;
        return this;
    };
    PlacingOrdinaryTile.prototype = _.extend(Object.create(placingTileMethods), {
        openAreaIsSelectable: true,
        selectOpenArea: function () {
            this.cancel();
        }
    });

    var PlacingGoalTile = function (stateManager) {
        this.stateManager = stateManager;
        return this;
    };
    PlacingGoalTile.prototype = _.extend(Object.create(placingTileMethods), {
        goalAreaIsSelectable: true,
        selectGoalTile: function () {
            this.cancel();
        }
    });

    return {
        PlacingGoalTile: PlacingGoalTile,
        PlacingOrdinaryTile: PlacingOrdinaryTile
    }
});