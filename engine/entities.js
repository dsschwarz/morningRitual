/**
 * Created by dan-s on 30/01/2016.
 */


function Port(portType, cardType, definition) {
    this.id = UniqueIdProvider.getId();
    this.portType = portType;
    this.cardType = cardType;
    this._loadFromDefinition(definition);
    return this;
}

var portProto = Port.prototype;
portProto._loadFromDefinition = function (definition) {
    this.tags = definition.split(" ");
};


function Card(definition) {
    this.id = UniqueIdProvider.getId();
    this.cardType = definition.cardType;
    this.inputs = definition.inputs.map(function (portDef) {
        return new Port(portTypes.INPUT, definition.cardType, portDef)
    });
    this.outputs = definition.outputs.map(function (portDef) {
        return new Port(portTypes.OUTPUT, definition.cardType, portDef)
    });

    this.getName = function () {
        return definition.name;
    };
    return this;
}
