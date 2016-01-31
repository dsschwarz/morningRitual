var uniqueIds = require("../util");

/**
 * Created by dan-s on 30/01/2016.
 */

// This class is not in use. Remove this comment when this class is used again
function Port(portType, definition) {
    this.id = uniqueIds.getId();
    this.portType = portType;
    this._loadFromDefinition(definition);
    return this;
}

var portProto = Port.prototype;
portProto._loadFromDefinition = function (definition) {
    this.tags = definition.split(" "); // actual logic will have to be more complex
};

/**
 * The basic definition of a card
 * @param definition The json definition of the card
 * @returns {Card}
 * @constructor
 */
function Card(definition) {
    this.id = uniqueIds.getId();
    this.imageData = definition.imageData;

    this.toDTO = function () {
        return {
            id: this.id,
            imageData: this.imageData
        }
    };
    return this;
}

module.exports = Card;
