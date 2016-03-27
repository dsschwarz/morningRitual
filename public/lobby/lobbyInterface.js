requirejs(["networking/lobbyNetworkingService", "peopleList"], function (Networking, peopleList) {
    var networkingService = new Networking();
    
    networkingService.getLobbyState().then(function (lobbyState) {
        peopleList.updatePeopleList(lobbyState.players);

        networkingService.onChange(function (newState) {
            peopleList.updatePeopleList(newState.players);
        })
    });
});