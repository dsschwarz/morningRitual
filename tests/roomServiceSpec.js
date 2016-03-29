var RoomService = require("../server/roomService/roomService");
var assert = require("assert");

var fakeUser = {
    username: "Charlie Sheen",
    id: "123"
};
var fakeUser2 = {
    username: "Hugh Laurie",
    id: "321"
};
function fakeIO() {
    return {
        emit: function () {
        }
    }
}
function createRoomService() {
    return new RoomService(fakeIO());
}
describe("roomService", function () {
    it("Should create a lobby for valid parameters", function () {
        var roomService = createRoomService();
        var lobbyName = "My Lobby";
        var lobby = roomService.createLobby(fakeUser, lobbyName);
        assert(roomService.getLobby(lobby.id) == lobby);
        assert(lobby.name == lobbyName);
    });

    it("Should not allow lobby creation without a name", function () {
        var roomService = createRoomService();
        var lobbyName = "";

        var createLobbyMethod = roomService.createLobby.bind(roomService, fakeUser, lobbyName);
        assert.throws(createLobbyMethod);
    });

    it("Should not allow lobby creation with an invalid name", function () {
        var roomService = createRoomService();
        var lobbyName = {test: "I'm an object!"};

        var createLobbyMethod = roomService.createLobby.bind(roomService, fakeUser, lobbyName);
        assert.throws(createLobbyMethod);
    });

    it("Allows joining a lobby", function () {
        var roomService = createRoomService();
        var lobby = roomService.createLobby(fakeUser, "Test Lobby");
        roomService.joinLobby(lobby.id, fakeUser2);
        var fetchedLobby = roomService.getLobby(lobby.id);
        assert(fetchedLobby.getPlayers().length == 2);
        assert(fetchedLobby.getPlayer(fakeUser2.id) == fakeUser2);
    });

    it("Prevents joining a lobby twice", function () {
        var roomService = createRoomService();
        var lobby = roomService.createLobby(fakeUser, "Test Lobby");
        assert.throws(roomService.joinLobby.bind(roomService, lobby.id, fakeUser));
    });

    it("Prevents joining a lobby that does not exist", function () {
        var roomService = createRoomService();
        assert.throws(roomService.joinLobby.bind(roomService, 404, fakeUser));
    });

    it("Begins a game", function () {
        var roomService = createRoomService();
        var lobby = roomService.createLobby(fakeUser, "Test Lobby");
        var game = roomService.beginGame(lobby.id);
        assert(game.getPlayer(fakeUser.id) == fakeUser, "User in lobby was not added to game");
    });

    it("Prevents beginning a game from a non-existent lobby", function () {
        var roomService = createRoomService();
        var lobby = roomService.createLobby(fakeUser, "Test Lobby");
        assert.throws(roomService.beginGame.bind(lobby.id+1));
    });

    it("Prevents beginning a game twice", function () {
        var roomService = createRoomService();
        var lobby = roomService.createLobby(fakeUser, "Test Lobby");
        roomService.beginGame(lobby.id);
        assert.throws(roomService.beginGame.bind(lobby.id));
    });
});