var express = require('express');
var router = express.Router();
var assert = require('assert');
var AssertionError = assert.AssertionError;

function handleError(req, res, error) {
    var message;
    if (error instanceof AssertionError) {
        message = error.message;
    } else {
        console.error("Lobby failure");
        console.error(error);
        message = "An unknown error occurred";
    }
    req.flash('danger', message);
    res.redirect('/');
}

/**
 * Controller to handle lobby related actions
 * @param roomService {RoomService}
 * @param userService {UserService}
 * @returns {LobbyController}
 */
function getRoutes(roomService, userService) {
    router.get("/:lobbyId", function (req, res, next) {
        var lobbyId = parseInt(req.params.lobbyId);
        var lobby = roomService.getLobby(lobbyId);
        if(lobby == undefined) {
            req.flash("danger", "Lobby does not exist");
            res.redirect("/");
        } else {
            res.render("lobby", {lobby: lobby, title: "Lobby"});
        }
    });

    router.get("/:lobbyId/state", function (req, res, next) {
        var lobbyId = parseInt(req.params.lobbyId);
        var lobby = roomService.getLobby(lobbyId);
        res.send(lobby.getState());
    });

    router.post("/:lobbyId/join", function (req, res, next) {
        var userId = req.cookies.playerId;
        var lobbyId = parseInt(req.params.lobbyId);
        userService.getUserById(userId).then(function (user) {
            roomService.joinLobby(lobbyId, user);
            res.redirect("/lobby/" + lobbyId);
        }).catch(function (error) {
            handleError(req, res, error);
        });
    });

    router.post("/:lobbyId/begin", function (req, res, next) {
        var lobbyId = parseInt(req.params.lobbyId);
        var newGame = roomService.beginGame(lobbyId);
        res.redirect("/game/" + newGame.id);
    });

    router.post("/create", function (req, res, next) {
        var userId = req.cookies.playerId;
        userService.getUserById(userId).then(function (user) {
            var lobby = roomService.createLobby(user, req.body.name);
            res.redirect("/lobby/" + lobby.id);
        }).catch(function (error) {
            handleError(req, res, error);
        });
    });

    return router;
}

module.exports = getRoutes;