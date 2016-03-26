define(["networking/connect"], function (connect) {
    var GameNetworkingService = function () {
        var that = this;
        this.socket = io();
        this._gameStateCallbacks = [];
        this.playerId = connect.connect("connectGame", this.socket);

        this.beginListening();
        return this;
    };
    
    GameNetworkingService.prototype.beginListening = function () {
        var that = this;
        this.socket.on("userError", function (e) {
            console.error(e);
        });
        
        this.socket.on("updateGameState", function (newState) {
            that._gameStateCallbacks.each(function (callback) {
                callback.call(null, newState);
            });
        });
    };

    GameNetworkingService.prototype.onGameStateChange = function(callback) {
        this._gameStateCallbacks.push(callback);
    };

    GameNetworkingService.prototype.getGameState = function () {
        // send http request
    };

    GameNetworkingService.prototype.placeTile = function(row, column) {
        this.socket.emit("placeTile", row, column);
    };

    GameNetworkingService.prototype.discardTile = function() {
        this.socket.emit("discardTile");
    };

    GameNetworkingService.prototype.takeFromOpenArea = function (tile) {
        var deferred = new $.Deferred();
        // TODO create http request
        this.socket.once("takeFromOpenAreaResult", function (result) {
            deferred.resolve(result);
        });
        this.socket.emit("takeFromOpenArea", tile.id);
        return deferred.promise();
    };

    GameNetworkingService.prototype.drawTile = function () {
        var deferred = new $.Deferred();
        // TODO http request
        this.socket.once("tileDrawn", function (tileData) {
            deferred.resolve(tileData);
        });
        this.socket.emit("drawCard");
        return deferred.promise();
    };

    return GameNetworkingService;
});