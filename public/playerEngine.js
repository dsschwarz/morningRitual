/**
 * Created by dan-s on 30/01/2016.
 */

function PlayerEngine() {
    this._items = [];
    return this;
}

var pEngineProto = PlayerEngine.prototype;
pEngineProto.canPlaceCard = function(card, row, column) {
    var existingCard = this.getCard(row, column);

    var neighbouringCard =
        this._items.length == 0 ||
        this.getCard(row - 1, column) ||
        this.getCard(row + 1, column) ||
        this.getCard(row, column - 1) ||
        this.getCard(row, column + 1);

    return !existingCard && neighbouringCard;
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