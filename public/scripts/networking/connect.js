define(["underscore"], function (_) {
    /**
     * This is a helper class to help the networking service connect to a room on the server
     */
    return {
        connect: function (connectionChannel, roomId, socket) {
            var cookieString = document.cookie;
            var playerId;
            _.each(cookieString.split(";"), function (cookiePair) {
                var split = cookiePair.split("=");
                var cookieName = split[0].trim();
                if (cookieName == "playerId") {
                    playerId = split[1];
                }
            });
            if (playerId) {
                socket.once("joined", function (player) {
                    if (player._id == playerId) {
                        console.log("Successfully joined");
                    } else {
                        throw new Error("Problem reconnecting. Ids do not match");
                    }
                });
                socket.emit(connectionChannel, playerId, roomId);
                return playerId;
            } else {
                throw new Error("Missing user id")
            }
        }
    }
});