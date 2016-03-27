var express = require('express');
var router = express.Router();

function getRoutes(roomService) {
    router.get("/:gameId", function (req, res, next) {
        res.render("game", {
            title: "Morning Ritual",
            gameId: parseInt(req.params.gameId)
        });
    });
    router.get("/:gameId/state", function (req, res, next) {
        var game = roomService.getGame(parseInt(req.params.gameId));
        res.send(game.getGameState());
    });
    
    // TODO turn into post method
    router.get("/:gameId/gameAction", function (req, res, next) {
        var params = req.query;
        

        var result = roomService.performGameAction(parseInt(req.params.gameId), req.cookies.playerId, params.action);
        res.send(result);
    });

    return router;
}

module.exports = getRoutes;