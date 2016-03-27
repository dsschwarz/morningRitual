var uniqueIds = require("../uniqueIds");
var _ = require("underscore");

module.exports = {
    createTile: function (definition) {
        return _.extend(Object.create(definition), {
            id: uniqueIds.getId(),
            isGoalTile: function () {
                return _.isFinite(definition.score);
            },
            toDTO: function () {
                return {
                    id: this.id,
                    imageId: this.imageId,
                    name: this.name,
                    score: this.score
                }
            }
        })
    },
    placeTile: function (tile, row, column) {
        return _.extend(Object.create(tile), {
            row: row,
            column: column,
            toDTO: function () {
                return _.extend(tile.toDTO(), {
                    row: this.row,
                    column: this.column,
                });
            }
        })
    }
};
