function Engine(players) {
    var self = this;
    this.openArea = new CardCollection();
    this._playerEngines = {};

    _.each(players, function (player) {
        self._playerEngines[player.id] = new PlayerEngine();
    });

    return this;
}

Engine.prototype.getPlayerEngine = function (player) {
    return this._playerEngines[player.id];
};

/**
 * Returns an array of the open cards.
 */
Engine.prototype.getOpenCards = function () {
    return this.openArea.getCards();
};

Engine.prototype.updateState = function (newState) {
    this.openArea.updateCards(newState.openArea);
    _.each(newState.playerCards, function (cards, id) {
        this._playerEngines[id].updateCards(cards);
    }, this);
};