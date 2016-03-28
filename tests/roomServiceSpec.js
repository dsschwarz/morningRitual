var RoomService = require("../server/roomService/roomService");

describe("roomService", function () {
    it("Should not allow you to join a non existent lobby", function () {
        var roomService = new RoomService();
    });
});