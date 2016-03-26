requirejs(["networking/lobbyNetworkingService"], function (Networking) {
    var networkingService = new Networking();
    
    networkingService.getLobbyState().then(function (lobbyState) {
        debugger;
    });
});