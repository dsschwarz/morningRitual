var uniqueIds = require("../util");
var _ = require("underscore");
var Game = require("game");

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

    this.performGameAction = function(gameId, playerId, action) {
        gameManager.performGameAction(gameId, playerId, action);
    }
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
    var currentTile = null;

    var updateStates = function (emitter) {
        emitter.emit("updateGameState", gameEngine.getGameState());
    };
}

function removeById(list, id) {
    var index = _.findIndex(list, {id: id});
    list.splice(index, 1);

    return index !== -1;
}