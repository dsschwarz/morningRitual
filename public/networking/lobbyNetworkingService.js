define(["networking/connect", "jquery"], function (connect, $) {
    var LobbyNetworkingService = function () {
        var that = this;
        this.socket = io();
        this._lobbyChangeCallbacks = [];
        this.playerId = connect.connect("connectGame", this.socket);

        this.beginListening();
        return this;
    };
    
    LobbyNetworkingService.prototype.beginListening = function () {
        var that = this;
        this.socket.on("userError", function (e) {
            console.error(e);
        });

        this.socket.on("updateLobbyState", function (newState) {
            that._lobbyChangeCallbacks.each(function (callback) {
                callback.call(null, newState);
            });
        });
    };



    LobbyNetworkingService.prototype.onChange = function(callback) {
        this._lobbyChangeCallbacks.push(callback);
    };

    LobbyNetworkingService.prototype.getLobbyState = function () {
        return $.get("state");
    };
    
    return LobbyNetworkingService;
});