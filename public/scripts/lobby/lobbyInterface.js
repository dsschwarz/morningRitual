requirejs(["networking/lobbyNetworkingService", "utils/peopleList"], function (Networking, peopleList) {
    var networkingService = new Networking();
    
    networkingService.getLobbyState().then(function (lobbyState) {
        peopleList.updatePeopleList(lobbyState.players);

        networkingService.onLobbyListChange(function (newState) {
            peopleList.updatePeopleList(newState.players);
        })
    });
});