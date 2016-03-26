define([], function () {
    return {
        /**
         * Return true if this tile can be selected/clicked
         * @param tile {Tile}
         * @returns {boolean}
         */
        isTileSelectable: function (tile) {
            return false;
        },

        /**
         * Call this when the user selects a tile
         * @param tile
         */
        selectTile: function (tile) {
            console.warn("Empty handler");
        },

        /**
         * Call when the deck is selected
         * @param tile
         */
        selectDeck: function () {
            console.warn("Empty handler");
        },

        /**
         * Indicates if the user is allowed to click on the player area
         */
        playerAreaIsSelectable: false,

        /**
         * Indicates if the user is allowed to click on the open area
         */
        openAreaIsSelectable: false,

        /**
         * Indicates if the user is allowed to click on the goal area
         */
        goalAreaIsSelectable: false,

        /**
         * Call when the user selects a position in their OWN area
         * @param row {int}
         * @param column {int}
         */
        selectPlayerArea: function (row, column) {
            console.warn("Empty handler");
        },

        /**
         * Call when the user selects the open area
         */
        selectOpenArea: function () {
            console.warn("Empty handler");
        },

        /**
         * Call when the user selects the goal area
         */
        selectGoalArea: function () {
            console.warn("Empty handler");
        },

        /**
         * Cancel the existing action
         */
        cancel: function () {
            console.warn("Empty handler");
        }
    };
});