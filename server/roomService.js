var uniqueIds = require("../uniqueIds");
var _ = require("underscore");
var Game = require("./game");

/**
 * A room is a collection of players. It can be either a lobby or an in-progress game
 * @constructor
 */
function RoomService(lobbyManager, gameManager, io) {
    this.joinLobby = function (lobbyId, player) {
        var lobby = lobbyManager.getLobby(lobbyId);
        lobby.addPlayer(player);
        io.emit("updateLobby", lobbyId, lobby.getLobbyState());
    };

    this.getGame = function (gameId) {
        return gameManager.getGame(gameId);
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

    this.performGameAction = function(gameId, playerId, action) {
        gameManager.performGameAction(gameId, playerId, action);
        io.emit("updateGameState", gameId, gameManager.getGame(gameId));
    };
    
    this.disconnectPlayer = function (playerId) {
        lobbyManager.lobbies().forEach(function (lobby) {
            var player = lobby.getPlayer(playerId);
            if (player) {
                player.disconnected = true;
                io.emit("updateLobby", lobby.id, lobby.getLobbyState());
            }
        });
        gameManager.games().forEach(function (game) {
            var player = game.getPlayer(playerId);
            if (player) {
                player.disconnected = true;
                io.emit("updateGameState", game.id, game.getGameState());
            }
        });
    };
    return this;
}

/**
 * Stores and retrieves the active lobbies
 * @constructor
 */
function LobbyManager() {
    var that = this;
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
    };

    this.connectPlayer = function (playerId, lobbyId, socket) {
        var lobby = this.getLobby(lobbyId);
        var person = lobby.getPlayer(playerId);
        if (person && person.disconnected) {
            person.disconnected = false;

            socket.emit("joined", person);
        } else {
            socket.emit("userError", "Cannot connect");
        }
    };
    return this;
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
    this.getPlayer = function (id) {
        return _.findWhere({
            id: id
        });
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

    this.getLobbyState = function () {
        return {
            players: players
        }
    }
    return this;
}

/**
 * Handles all the games running on this server
 * @constructor
 */
function GameManager() {
    var games = [];

    this.games = function () {
        return games;
    };

    this.getGame = function (id) {
        return _.findWhere(games, {id: id})
    };

    this.createGame = function (players) {
        var newGame = new Game(players);
        games.push(newGame);
        return newGame;
    };

    this.performGameAction = function (gameId, playerId, actionDto) {
        var game = this.getGame(gameId);
        var actionName = actionDto.name;
        if (actionName == "drawTile") {
            game.drawTile(playerId);
        } else if (actionName == "placeTile") {
            game.placeTile(playerId, actionDto.row, actionDto.column);
        } else if (actionName == "discardTile") {
            game.discardTile(playerId);
        } else if (actionName == "takeOpenTile") {
            game.takeOpenTile(playerId, actionDto.tileId);
        } else if (actionName == "takeGoalTile") {
            game.takeGoalTile(playerId, actionDto.tileId);
        }
    };

    this.connectPlayer = function (playerId, gameId, socket) {
        var game = this.getGame(gameId);
        var person = game.getPlayer(playerId);
        if (person && person.disconnected) {
            person.disconnected = false;
            socket.emit("joined", person);
        } else {
            socket.emit("userError", "Cannot connect");
        }
    };
    return this;
}

function removeById(list, id) {
    var index = _.findIndex(list, {id: id});
    list.splice(index, 1);

    return index !== -1;
}

module.exports = {
    RoomService: RoomService,
    GameManager: GameManager,
    LobbyManager: LobbyManager
};