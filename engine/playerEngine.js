/**
 * Created by dan-s on 30/01/2016.
 */

function PlayerEngine() {
    this._items = [];
    this._slots = new SlotManager();
    this._connections = []; // list of connections from one port to another
    return this;
}

var pEngineProto = PlayerEngine.prototype;
pEngineProto.validConnection = function(portA, portB) {
    // must be item -> connector, connector -> item
    if (portA.cardType == portB.cardType) {
        // "Trying to connect two cards of the same type"
        return false;
    }

    try {
        var pair = helpers.portPair(portA, portB);
    } catch(e) {
        if (e.message = "Invalid ports") {
            //Must connect an output to an input
            return false;
        }
    }

    return _.every(pair.input.tags, function (tag) {
        return _.contains(pair.output.tags, tag);
    });
};

pEngineProto.addCardToMachine = function (card) {
    this._items.push(card);
};

pEngineProto.connect = function(portA, portB) {
    this._connections.push(new Connection(portA, portB))
};

pEngineProto.getItems = function () {
    return this._items;
};