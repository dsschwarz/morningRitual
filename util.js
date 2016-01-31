/**
 * Created by dan-s on 30/01/2016.
 */

var portTypes = {
    INPUT: "INPUT",
    OUTPUT: "OUTPUT"
};

var cardTypes = {
    ITEM: "ITEM",
    CONNECTOR: "CONNECTOR"
};

var UniqueIdProvider = (function () {
    var id = 0;
    return {
        getId: function() {
            return id++;
        }
    }
})();

var helpers = {
    portPair: function (portA, portB) {
        var input, output;
        if (portA.portType == portTypes.INPUT &&
            portB.portType == portTypes.OUTPUT) {
            input = portA;
            output = portB;
        } else if (portA.portType == portTypes.OUTPUT &&
            portB.portType == portTypes.INPUT) {
            input = portB;
            output = portA;
        } else {
            throw new Error("Invalid ports");
        }

        return {
            input: input,
            output: output
        }
    }
};