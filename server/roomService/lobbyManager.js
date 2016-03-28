var Lobby = require("../lobby/lobby");
var _ = require("underscore");

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
        return _.findWhere(lobbies, {id: id});
    };

    this.createLobby = function (owner, name) {
        var newLobby = new Lobby(owner, name);
        lobbies.push(newLobby);
        return newLobby;
    };

    this.removeLobby = function (id) {
        var index = _.findIndex(lobbies, {id: id});
        lobbies.splice(index, 1);

        return index !== -1;
    };
    return this;
}

module.exports = LobbyManager;