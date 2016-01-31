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