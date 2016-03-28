define(["networking/connect", "jquery"], function (connect, $) {
    var LobbyNetworkingService = function () {
        var that = this;
        this.socket = io();
        this._lobbyChangeCallbacks = [];
        this.playerId = connect.connect("connectLobby", window.LOBBY_ID, this.socket);

        this.beginListening();
        return this;
    };
    
    LobbyNetworkingService.prototype.beginListening = function () {
        var that = this;
        this.socket.on("userError", function (e) {
            console.error(e);
        });

        this.socket.on("updateLobbyState", function (lobbyId, newState) {
            if (lobbyId == window.LOBBY_ID) {
                that._lobbyChangeCallbacks.forEach(function (callback) {
                    callback.call(null, newState);
                });
            }
        });
        
        this.socket.on("beginGame", function (lobbyId, gameId) {
            if (lobbyId == window.LOBBY_ID) {
                window.location = "/game/" + gameId;
            }
        })
    };

    LobbyNetworkingService.prototype.onLobbyListChange = function(callback) {
        this._lobbyChangeCallbacks.push(callback);
    };

    LobbyNetworkingService.prototype.getLobbyState = function () {
        return $.get(window.location.toString() + "/state");
    };
    
    return LobbyNetworkingService;
});