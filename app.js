var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require("underscore");
var assert = require("assert");
var Player = require("./player");
var $engine = require("./server/engine");

var gameEngine = null;
var people = [];
app.use(express.static('public'));
app.get('/', function(req, res){
    res.sendfile('main.html');
});

io.on('connection', function(socket){
    var player;
    var currentCard = null;

    var updateStates = function (emitter) {
        var playerCards = {};
        _.each(people, function (p) {
            playerCards[p.id] = gameEngine.getPlayerEngine(p).getCards();
        });
        emitter.emit("updateGameState", {
            openArea: gameEngine.openArea.getCards().map(function (c) { return c.toDTO()}),
            playerCards: playerCards
        });
    };

    socket.on("getPlayers", function () {
        socket.emit("updatePeople", people); // update just this client
    });
    socket.on("getGameState", function () {
        if (gameEngine) {
            // update just this client
            updateStates(socket);
        }
    });

    socket.on("join", function (name) { // TODO pass id and use existing player if possible. For reconnects
        if (gameEngine == null) {
            player = new Player(name);
            people.push(player);
            io.emit("updatePeople", people);
            socket.emit("joined", player);
        } else {
            socket.emit("userError", "Cannot join game in progress");
        }
    });

    socket.on("requestStart", function () {
        gameEngine = new $engine.Engine(people);
        io.emit("begin", people); // emit necessary data here
    });

    socket.on("addCardToMachine", function (row, column) {
        if (!currentCard) {
            socket.emit("userError", "No card selected");
            return;
        }
        var playerEngine = gameEngine.getPlayerEngine(player);

        if (playerEngine.canPlaceCard(currentCard, row, column)) {
            playerEngine.addCardToMachine(currentCard, row, column);
            currentCard = null;
            updateStates(io);
        } else {
            socket.emit("userError", "Invalid position");
        }
    });

    socket.on("addCardToOpenArea", function () {
        if (!currentCard) {
            socket.emit("userError", "No card selected");
            return;
        }
        gameEngine.openArea.addCard(currentCard);
        currentCard = null;
        updateStates(io);
    });

    socket.on("drawCard", function () {
        if (!player) {
            socket.emit("userError", "Not part of current game");
            return;
        }
        if (!!currentCard) {
            socket.emit("userError", "Card already selected");
            return;
        }
        currentCard = gameEngine.deck.drawCard();
        socket.emit("cardDrawn", currentCard.toDTO());
    });

    socket.on("takeFromOpenArea", function (cardId) {
        if (!!currentCard) {
            socket.emit("userError", "Card already selected");
            return;
        }
        var openCards = gameEngine.openArea.getCards();
        var validCard = _.some(openCards, function (c) {
            return c.id == cardId;
        });
        if (validCard) {
            currentCard = gameEngine.openArea.removeCardById(cardId);
            socket.emit("takeFromOpenAreaResult", true);
            updateStates(io);
        } else {
            socket.emit("takeFromOpenAreaResult", false);
            updateStates(socket);
        }
    });

    socket.on("kick", function (id) {
        var index = _.findIndex(people, function (p) {
            return p.id == id;
        });
        var person = people[index];
        if (person && person.disconnected && !gameEngine) {
            people.splice(index, 1);
            socket.emit("updatePeople", people);
        }
    });

    socket.on('disconnect', function(){
        if (player) {
            player.disconnected = true;
            socket.emit("updatePeople", people);
        }
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
