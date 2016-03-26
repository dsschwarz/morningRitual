var express = require('express');
var router = express.Router();
var assert = require('assert');
var AssertionError = assert.AssertionError;

function tryWithRedirect(req, res, action) {
    try {
        action.call();
    } catch (e) {
        var message;
        if (e instanceof AssertionError) {
            message = e.message;
        } else {
            console.error("Lobby join failure");
            console.error(e);
            message = "An unknown error occurred";
        }
        req.flash('error', message);
        res.redirect('/');
    }
}

function getRoutes(roomService, userService) {
    router.get("/:lobbyId", function (req, res, next) {
        var lobbyId = parseInt(req.params.lobbyId);
        var lobby = roomService.getLobby(lobbyId);
        res.render("lobby", {lobby: lobby, title: "Lobby"})
    });

    router.get("/:lobbyId/state", function (req, res, next) {
        var lobbyId = parseInt(req.params.lobbyId);
        var lobby = roomService.getLobby(lobbyId);
        res.send(lobby.getLobbyState());
    });

    router.post("/:lobbyId/join", function (req, res, next) {
        tryWithRedirect(req, res, function () {
            var userId = req.cookies.playerId;
            var lobbyId = parseInt(req.params.lobbyId);
            roomService.joinLobby(lobbyId, userId);
            res.redirect("/lobby/" + lobbyId);
        });
    });

    router.post("/:lobbyId/beginGame", function (req, res, next) {
        var lobbyId = parseInt(req.params.lobbyId);
        var newGame = roomService.beginGame(lobbyId);
        res.redirect("/game/" + newGame.id);
    });

    router.post("/create", function (req, res, next) {
        tryWithRedirect(req, res, function () {
            var userId = req.cookies.playerId;
            var lobby = roomService.createLobby(userId, req.body.name);
            res.redirect("/lobby/" + lobby.id);
        });
    });

    return router;
}

module.exports = getRoutes;