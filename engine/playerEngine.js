/**
 * Created by dan-s on 30/01/2016.
 */

function PlayerEngine() {
    this._items = [];
    this._slots = new SlotManager(3);
    this._connections = []; // list of connections from one port to another
    return this;
}

var pEngineProto = PlayerEngine.prototype;
pEngineProto.canPlaceCard = function(card, row, column) {
    var existingCard = this.getCard(row, column);

    return !existingCard;
};

pEngineProto.addCardToMachine = function (card, row, column) {
    if (this.canPlaceCard(card, row, column)) {
        card.row = row;
        card.column = column;
        this._items.push(card);
    }
};

pEngineProto.getCard = function (row, column) {
    return _.findWhere(this._items, {
        row: row,
        column: column
    });
};

pEngineProto.getCards = function () {
    return this._items;
};