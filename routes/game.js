var express = require('express');
var router = express.Router();


/**
 * Controller to handle game related actions
 * @param roomService {RoomService}
 * @returns {*}
 */
function getRoutes(roomService) {
    router.get("/:gameId", function (req, res, next) {
        var id = parseInt(req.params.gameId);
        var game = roomService.getGame(id);
        if(game == undefined) {
            req.flash("danger", "Game does not exist");
            res.redirect("/");
        } else {
            res.render("game", {
                title: "Morning Ritual",
                gameId: id
            });
        }
    });
    router.get("/:gameId/state", function (req, res, next) {
        var game = roomService.getGame(parseInt(req.params.gameId));
        res.send(game.getState());
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