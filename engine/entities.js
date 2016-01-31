/**
 * Created by dan-s on 30/01/2016.
 */

// This class is not in use. Remove this comment when this class is used again
function Port(portType, definition) {
    this.id = UniqueIdProvider.getId();
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
    this.id = UniqueIdProvider.getId();
    this.imageData = definition.imageData;

    this.getName = function () {
        return definition.name;
    };

    return this;
}
