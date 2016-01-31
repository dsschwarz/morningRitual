//function Connection(portA, portB) {
//    var pair = helpers.portPair(portA, portB);
//    this.input = pair.input;
//    this.output = pair.output;
//    this.hasPort = function (port) {
//        return pair.input.id == port.id || pair.output.id == port.id;
//    };
//    return this;
//}

//function SlotManager(max) {
//    this._slots = [];
//
//    this._maxSlots = max;
//
//    return this;
//}
//
//SlotManager.prototype.addToSlot = function(slotNumber, card) {
//    if (!this.validSlotNumber(slotNumber)) {
//        throw new Error("Invalid slot number")
//    }
//
//    if (!this.isSlotOpen(slotNumber)) {
//        throw new Error("Slot is already in use")
//    }
//
//    this._slots[slotNumber] = card;
//};
//
//SlotManager.prototype.isSlotOpen = function (slotNumber) {
//    return this._slots[slotNumber] == undefined
//};
//
//SlotManager.prototype.removeFromSlot = function(slotNumber) {
//    var card = this._slots[slotNumber];
//    delete this._slots[slotNumber];
//    return card;
//};
//SlotManager.prototype.removeCard = function(card) {
//    var index = _.indexOf(this._slots, card);
//    delete this._slots[index];
//    return card;
//};
//
//SlotManager.prototype.validSlotNumber = function(slotNumber) {
//    return slotNumber >= 0 && slotNumber < this._maxSlots;
//};
//
//SlotManager.prototype.getCards = function() {
//    return this._slots;
//};

var _ = require("underscore");

function CardCollection() {
    this._cards = [];
    return this;
}

CardCollection.prototype.addCard = function (card) {
    this._cards.push(card);
};

CardCollection.prototype.removeCard = function (card) {
    var index = _.indexOf(this._cards, card);
    this._cards.splice(index, 1);
};

CardCollection.prototype.removeCardById = function (cardId) {
    var index = _.findIndex(this._cards, function (c) {
        return c.id == cardId;
    });
    var card = this._cards[index];
    this._cards.splice(index, 1);
    return card;
};

CardCollection.prototype.getCards = function () {
    return this._cards;
};

module.exports = CardCollection;