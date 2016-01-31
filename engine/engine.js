/**
 * Created by dan-s on 30/01/2016.
 */

function Engine(players) {
    var self = this;
    this._openCardsMax = 5;
    this._deck = new Deck();
    this._openCards = new SlotManager(this._openCardsMax);
    this._playerEngines = {};

    _.each(players, function (player) {
        self._playerEngines[player.id] = new PlayerEngine();
    });

    this.fillOpenArea();

    return this;
}

Engine.prototype.fillOpenArea = function () {
    for(var i=0; i < this._openCardsMax; i++) {
        if (this._openCards.isSlotOpen(i)) {
            this._openCards.addToSlot(i, this._deck.drawCard());
        }
    }
};

Engine.prototype.moveCardToMachine = function (player, card) {
    // must validate player exists, card is in the open card area

    this._openCards.removeCard(card);
    this.getPlayerEngine(player).addCardToMachine(card);
};

Engine.prototype.getPlayerEngine = function (player) {
    return this._playerEngines[player.id];
};

Engine.prototype.getPlayerItems = function (player) {
    return this.getPlayerEngine(player).getItems();
};

/**
 * Returns an ordered array of the open cards.
 */
Engine.prototype.getOpenCards = function () {
    return this._openCards.getCards();
};
