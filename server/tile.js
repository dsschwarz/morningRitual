var uniqueIds = require("../uniqueIds");
var _ = require("underscore");

module.exports = {
    createTile: function (definition) {
        return _.extend(Object.create(definition), {
            id: uniqueIds.getId(),
            isGoalTile: function () {
                return definition.score instanceof Number;
            },
            toDTO: function () {
                return {
                    id: this.id,
                    imageId: this.imageId
                }
            }
        })
    },
    placeTile: function (tile, row, column) {
        return _.extend(Object.create(tile), {
            row: row,
            column: column,
            toDTO: function () {
                return {
                    id: this.id,
                    imageId: this.imageId,
                    row: this.row,
                    column: this.column
                }
            }
        })
    }
};
