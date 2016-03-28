var uniqueIds = require("../uniqueIds");
var _ = require("underscore");
var assert = require("assert");
var LobbyManager = require("./lobbyManager");
var GameManager = require("./gameManager");

/**
 * A room is a collection of players. It can be either a lobby or an in-progress game
 * @constructor
 */
function RoomService(io) {
    var lobbyManager = new LobbyManager();
    var gameManager = new GameManager();
    this.getLobbies = function () {
        return lobbyManager.lobbies();
    };

    this.getGame = function (gameId) {
        assert(_.isNumber(gameId), "Invalid lobby ID");
        return gameManager.getGame(gameId);
    };

    this.getLobby = function (lobbyId) {
        assert(_.isFinite(lobbyId), "Invalid lobby ID");
        return lobbyManager.getLobby(lobbyId);
    };

    this.createLobby = function (user, name) {
        assert(_.isString(name), "Invalid lobby name");
        assert(name.length, "Missing lobby name");
        // assert(owner instanceof Player);
        return lobbyManager.createLobby(user, name);
    };

    this.joinLobby = function (lobbyId, user) {
        assert(_.isFinite(lobbyId), "Invalid lobby ID");
        var lobby = lobbyManager.getLobby(lobbyId);
        assert(!lobby.getPlayer(user.id), "Already in lobby");
        assert(lobby, "Lobby does not exist");
        lobby.addPlayer(user);
        io.emit("updateLobbyState", lobbyId, lobby.getLobbyState());
    };

    this.beginGame = function (lobbyId) {
        assert(_.isFinite(lobbyId), "Invalid lobby ID");
        var lobby = lobbyManager.getLobby(lobbyId);

        // this will only call removeLobby if the lobby exists
        if (lobby != undefined && lobbyManager.removeLobby(lobbyId)) {
            // if the lobby was successfully removed, then create the game
            var game = gameManager.createGame(lobby.getPlayers());
            io.emit("beginGame", lobbyId, game.id);
            return game;
        } else {
            throw new Error("Could not remove lobby " + lobbyId)
        }
    };

    this.performGameAction = function(gameId, playerId, action) {
        var result = gameManager.performGameAction(gameId, playerId, action);
        io.emit("updateGameState", gameId, result);
        return result;
    };
    
    this.disconnectPlayer = function (playerId) {
        lobbyManager.lobbies().forEach(function (lobby) {
            var player = lobby.getPlayer(playerId);
            if (player) {
                player.disconnected = true;
                io.emit("updateLobbyState", lobby.id, lobby.getLobbyState());
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
    
    this.connectPlayer = function (playerId, roomId, socket) {
        var room = lobbyManager.getLobby(roomId) || gameManager.getGame(roomId);
        if (room) {
            var person = room.getPlayer(playerId);
            if (person) {
                if (person.disconnected) {
                    person.disconnected = false;

                    socket.emit("joined", person);
                } else {
                    socket.emit("userError", "Player is currently connected, cannot override");
                }
            } else {
                socket.emit("userError", "No matching player found in room");
            }
        } else {
            socket.emit("userError", "Room does not exist");
        }
    };
    
    return this;
}


module.exports = RoomService;