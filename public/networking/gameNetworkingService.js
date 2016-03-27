define(["networking/connect"], function (connect) {
    var GameNetworkingService = function () {
        var that = this;
        this.socket = io();
        this._gameStateCallbacks = [];
        this.playerId = connect.connect("connectGame", window.GAME_ID, this.socket);

        this.beginListening();
        return this;
    };
    
    GameNetworkingService.prototype.beginListening = function () {
        var that = this;
        this.socket.on("userError", function (e) {
            console.error(e);
        });
        
        this.socket.on("updateGameState", function (newState) {
            that._gameStateCallbacks.forEach(function (callback) {
                callback.call(null, newState);
            });
        });
    };

    GameNetworkingService.prototype.onGameStateChange = function(callback) {
        this._gameStateCallbacks.push(callback);
    };

    GameNetworkingService.prototype.getGameState = function () {
        return $.get(window.location + "/state");
    };

    GameNetworkingService.prototype.placeTile = function(row, column) {
        return this._takeAction("discardTile", {
            row: row,
            column: column
        });
    };

    GameNetworkingService.prototype.discardTile = function() {
        return this._takeAction("discardTile");
    };

    GameNetworkingService.prototype.takeFromOpenArea = function (tile) {
        return this._takeAction("takeOpenTile", {
            tileId: tile.id
        })
    };

    GameNetworkingService.prototype.drawTile = function () {
        return this._takeAction("drawTile");
    };

    GameNetworkingService.prototype._takeAction = function (actionName, params) {
        var action = {
            name: actionName
        };
        if (params) {
            _.extend(action, params);
        }
        return $.get(window.location + "/gameAction", {
            action: action
        });
    };

    return GameNetworkingService;
});