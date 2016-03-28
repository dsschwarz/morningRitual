var uniqueIds = require("../uniqueIds");
var _ = require("underscore");

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

    this.getState = function () {
        return {
            players: players
        }
    };
    return this;
}

module.exports = Lobby;