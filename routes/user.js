var express = require('express');
var router = express.Router();

function getRoutes(userService) {
    router.get("/login", function (req, res, next) {
        res.render("login");
    });

    router.post("/login", function (req, res, next) {
        var params = req.body;
        userService.validate(params.username, params.password).then(function (validationResult) {
            if (validationResult === true) {
                userService.getUserByUsername(params.username).then(function (user) {
                    console.log("User logged in - " + user.username);
                    req.session.user = user;
                    res.cookie("playerId", user.id);
                    res.redirect("/");
                }).catch(function (err) {
                    console.error(err);
                    next(err);
                });
            } else {
                req.flash("danger", "Invalid sign in credentials");
                res.redirect("/login");
            }
        }).catch(function (err) {
            next(err);
        });
    });
    router.get("/register", function (req, res, next) {
        res.render("register");
    });

    router.post("/register", function (req, res, next) {
        userService.createUser(req.body.username, req.body.password, req.body.email).then(function onSuccess() {
            console.log("Created user - " + req.body.username);
            req.flash("success", "User created! Please login to continue");
            res.redirect(307, '/login');
        }, function onError(err) {
            if (err.name == "ValidationError") {
                req.flash("danger", "Invalid information");
                res.redirect("/register")
            } else {
                next(err);
            }
        }).catch(function (error) {
            next(error);
        });
    });

    router.get("/logout", function (req, res, next) {
        req.session.user = null;
        req.flash("success", "Logged out");
        res.cookie("playerId", null);
        res.redirect("/login");
    });

    return router;
}

module.exports = getRoutes;