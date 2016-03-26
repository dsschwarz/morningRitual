var express = require('express');
var router = express.Router();

function getRoutes(roomService) {
    router.get("/", function (req, res, next) {
        var lobbies = roomService.getLobbies();
        res.render("index", {title: "Lobby List", lobbies: lobbies, errors: req.flash("error")});
    });

    router.get("/login", function (req, res, next) {
        res.render("login");
    });

    router.post("/login", function (req, res, next) {
        var params = req.body;

        res.send(params);
    });
    router.get("/register", function (req, res, next) {
        res.render("register");
    });

    router.post("/register", function (req, res, next) {
        var params = req.body;

        res.send(params);
    });

    return router;
}

module.exports = getRoutes;