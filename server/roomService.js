var uniqueIds = require("../uniqueIds");
var _ = require("underscore");
var Game = require("./game");
var Player = require("./player");
var assert = require("assert");

/**
 * A room is a collection of players. It can be either a lobby or an in-progress game
 * @constructor
 */
function RoomService(lobbyManager, gameManager, io) {
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
        io.emit("updateLobby", lobbyId, lobby.getLobbyState());
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
        return _.findWhere(lobbies, {id: id});
    };

    this.createLobby = function (owner, name) {
        var newLobby = new Lobby(owner, name);
        lobbies.push(newLobby);
        return newLobby;
    };

    this.removeLobby = function (id) {
        return removeById(lobbies, id);
    };

    this.connectPlayer = function (playerId, lobbyId, socket) {
        var lobby = this.getLobby(lobbyId);
        if (lobby) {
            var person = lobby.getPlayer(playerId);
            if (person) {
                if (person.disconnected) {
                    person.disconnected = false;

                    socket.emit("joined", person);
                } else {
                    socket.emit("userError", "Player is currently connected, cannot override");
                }
            } else {
                socket.emit("userError", "No matching player found in lobby");
            }
        } else {
            socket.emit("userError", "Lobby does not exist");
        }
    };
    return this;
}

/**
 * Holds a set of players
 * @constructor
 */
function Lobby(owner, name) {
    var players = [owner];
    this.id = uniqueIds.getId();
    this.name = name;

    owner.disconnected = true;

    this.getPlayers = function () {
        return players;
    };
    this.getPlayer = function (id) {
        return _.findWhere(players, {
            id: id
        });
    };

    this.addPlayer = function (player) {
        player.disconnected = true;
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
    };
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
        return game.getGameState();
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