define([], function () {
    var GameNetworkingService = function () {
        var that = this;
        this.socket = io();
        this._gameStateCallbacks = [];
        this.playerId = null;

        var cookieString = document.cookie;
        _.each(cookieString.split(";"), function (cookiePair) {
            var split = cookiePair.split("=");
            var cookieName = split[0].trim();
            if (cookieName == "playerId") {
                that.playerId = parseInt(split[1]); // all ids are numeric for now
            }
        });
        if (this.playerId) {
            this.socket.once("joined", function (player) {
                if (player.id == playerId) {
                    console.log("Successfully joined");
                } else {
                    throw new Error("Problem reconnecting. Ids do not match");
                }
            });
            this.socket.emit("customReconnect", this.playerId);
        } else {
            throw new Error("Missing user id")
        }
        this.beginListening();
        return this;
    };
    
    GameNetworkingService.prototype.beginListening = function () {
        var that = this;
        this.socket.on("userError", function (e) {
            console.error(e);
        });

        // TODO merge with game state update
        this.socket.on("updatePeople", function (newPeople) {
            // bubble up to renderer
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