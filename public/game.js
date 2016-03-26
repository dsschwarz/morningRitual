function Game(players, socket, player) {
    this.engine = new Engine(players);
    var currentPlayer = player || players[0];

    this.getPlayerEngine = function () {
        return this.engine.getPlayerEngine(currentPlayer);
    };

    this.showMachine = function(person) {
        currentPlayer = person;
    };

    this.showingMyArea = function () {
        return !!(player && currentPlayer.id == player.id);
    };

    this.addCardToMachine = function(card, row, column) {
        socket.emit("addCardToMachine", row, column);
        this.getPlayerEngine().addCardToMachine(card, row, column);
    };

    this.addCardToOpenArea = function(card) {
        socket.emit("addCardToOpenArea");
        this.engine.openArea.addCard(card);
    };

    this.takeFromOpenArea = function (card) {
        var deferred = new $.Deferred();
        socket.once("takeFromOpenAreaResult", function (result) {
            deferred.resolve(result);
        });
        socket.emit("takeFromOpenArea", card.id);
        return deferred.promise();
    };

    this.drawCard = function () {
        var deferred = new $.Deferred();
        socket.once("cardDrawn", function (cardData) {
            var card = new Card(cardData);
            deferred.resolve(card);
        });
        socket.emit("drawCard");
        return deferred.promise();
    };
}
