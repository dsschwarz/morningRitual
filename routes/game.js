var express = require('express');
var router = express.Router();

function getRoutes(roomService) {
    router.get("/:gameId", function (req, res, next) {
        res.render("game", {
            title: "Morning Ritual",
            gameId: req.params.gameId
        });
    });
    router.get("/:gameId/state", function (req, res, next) {
        var game = roomService.getGame(req.params.gameId);
        res.send(game.getGameState());
    });
    
    // TODO turn into post method
    router.get("/:gameId/gameAction", function () {
        var params = req.query;
        
        roomService.performGameAction(req.params.gameId, params.action);
    });

    return router;
}

module.exports = getRoutes;