var uniqueIds = require("../util");

/**
 * The basic definition of a card
 * @param definition The json definition of the card
 * @returns {Tile}
 * @constructor
 */
function Tile(definition) {
    this.id = ;
    this.prototype = definition;

    this.;
    return this;
}

module.exports = {
    createTile: function (definition) {
        return Object.create(definition, {
            id: uniqueIds.getId(),
            toDTO: function () {
                return {
                    id: this.id,
                    imageData: this.imageData
                }
            }
        })
    },
    placeTile: function (tile, row, column) {

    }
}
