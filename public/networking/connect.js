define(["underscore"], function (_) {
    return {
        connect: function (connectionChannel, socket) {
            var cookieString = document.cookie;
            var playerId;
            _.each(cookieString.split(";"), function (cookiePair) {
                var split = cookiePair.split("=");
                var cookieName = split[0].trim();
                if (cookieName == "playerId") {
                    playerId = parseInt(split[1]); // all ids are numeric for now
                }
            });
            if (playerId) {
                socket.once("joined", function (player) {
                    if (player.id == playerId) {
                        console.log("Successfully joined");
                    } else {
                        throw new Error("Problem reconnecting. Ids do not match");
                    }
                });
                socket.emit("customReconnect", playerId);
                return playerId;
            } else {
                throw new Error("Missing user id")
            }
        }
    }
});