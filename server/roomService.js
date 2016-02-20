var uniqueIds = require("../util");
var _ = require("underscore");

/**
 * A room is a collection of players. It can be either a lobby or an in-progress game
 * @constructor
 */
function RoomService(lobbyManager, gameManager) {
    this.joinLobby = function (lobbyId, player) {
        var lobby = lobbyManager.getLobby(lobbyId);
        lobby.addPlayer(player);
    };

    this.beginGame = function (lobbyId) {
        var lobby = lobbyManager.getLobby(lobbyId);

        // this will only call removeLobby if the lobby exists
        if (lobby != undefined && lobbyManager.removeLobby(lobbyId)) {
            // if the lobby was successfully removed, then create the game
            return gameManager.createGame(lobby.getPlayers());
        } else {
            throw new Error("Could not remove lobby " + lobbyId)
        }
    };
}

/**
 * Stores and retrieves the active lobbies
 * @constructor
 */
function LobbyManager() {
    var lobbies = [];

    this.lobbies = function () {
        return lobbies;
    };

    this.getLobby = function (id) {
        return _.findWhere(lobbies, {id: id})
    };

    this.createLobby = function (owner) {
        var newLobby = new Lobby(owner);
        lobbies.push(newLobby);
        return newLobby;
    };

    this.removeLobby = function (id) {
        return removeById(lobbies, id);
    }
}

/**
 * Holds a set of players
 * @constructor
 */
function Lobby(owner) {
    var players = [owner];
    this.id = uniqueIds.getId();

    this.getPlayers = function () {
        return players;
    };

    this.addPlayer = function (player) {
        players.push(player)
    };

    /**
     * Remove a player from the room.
     * @param playerId
     * @returns {boolean} True if success
     */
    this.kickPlayerById = function (playerId) {
        return removeById(players, playerId);
    };
}

function GameManager() {
    var games = [];

    this.games = function () {
        return games;
    };

    this.getGame = function (id) {
        return _.findWhere(games, {id: id})
    };

    this.createGame = function (players) {
        var newGame = new Engine(players);
        games.push(newGame);
        return newGame;
    }
}

/**
 * Layer connecting the web socket for a player to the game engine
 * @param gameEngine
 * @param player
 * @param socket
 * @param io
 * @constructor
 */
function GameSocketHandler(gameEngine, player, socket, io) {
    var currentCard = null;

    var updateStates = function (emitter) {
        emitter.emit("updateGameState", gameEngine.summarize());
    };

    socket.on("getGameState", function () {
        if (gameEngine) {
            // update just this client
            updateStates(socket);
        }
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
}

function removeById(list, id) {
    var index = _.findIndex(list, {id: id});
    list.splice(index, 1);

    return index !== -1;
}