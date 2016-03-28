var Game = require("../game/game");
var _ = require("underscore");

/**
 * Handles all the games running on this server
 * @constructor
 */
function GameManager() {
    var games = [];
    
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
            game.placeTile(playerId, parseInt(actionDto.row), parseInt(actionDto.column));
        } else if (actionName == "discardTile") {
            game.discardTile(playerId);
        } else if (actionName == "takeOpenTile") {
            game.takeOpenTile(playerId, actionDto.tileId);
        } else if (actionName == "takeGoalTile") {
            game.takeGoalTile(playerId, actionDto.tileId);
        } else {
            throw new Error("Unrecognized action - " + actionName)
        }
        return game.getState();
    };
    return this;
}

module.exports = GameManager;