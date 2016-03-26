var express = require('express');
var router = express.Router();

function getRoutes(roomService) {
    router.get("/:gameId", function (req, res, next) {
        var game = roomService.getGame(req.params.gameId);
        debugger;
    });
    
    // TODO turn into post method
    router.get("/:gameId/gameAction", function () {
        var params = req.query;
        
        var game = roomService.getGame(req.params.gameId);
        game.performGameAction(params.action);
    });

    return router;
}

module.exports = getRoutes;