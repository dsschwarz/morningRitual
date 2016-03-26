var express = require('express');
var router = express.Router();

function getRoutes(roomService) {
    router.get("/:lobbyId", function (req, res, next) {
        var lobby = roomService.getLobby(req.params.lobbyId);
        res.send(lobby.getLobbyState());
    });

    // TODO turn into post method
    router.get("/:lobbyId/beginGame", function (req, res, next) {
        var newGame = roomService.beginGame(req.params.lobbyId);
        res.redirect("/game/" + newGame.id);
    });

    return router;
}

module.exports = getRoutes;