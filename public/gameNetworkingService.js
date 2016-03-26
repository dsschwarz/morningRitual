define([], function () {
    var GameNetworkingService = function () {
        var that = this;
        this.socket = io();
        this.gameStateCallbacks = [];
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

        this.socket.on("updatePeople", function (newPeople) {
            // bubble up to renderer
        });
        this.socket.on("updateGameState", function (newState) {
            that.gameStateCallbacks.each(function (callback) {
                callback.call(null, newState);
            });
        });
    }
    
});