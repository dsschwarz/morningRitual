var express = require('express');
var router = express.Router();

function getRoutes(roomService) {
    router.get("/", function (req, res, next) {
        // var lobbies = roomService.getLobbies();
        res.render("index");
    });

    return router;
}

module.exports = getRoutes;