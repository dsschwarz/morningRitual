var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require("underscore");
var assert = require("assert");
var Player = require("./player");
var $engine = require("./server/engine");
var gameRoutes = require("./server/engine");

var gameEngine = null;
var people = [];
app.use(express.static('public'));
app.get('/', function(req, res){
    res.sendfile('main.html');
});

app.use('/game')

io.on('connection', function(socket){
    var player;

    socket.on("getPlayers", function () {
        socket.emit("updatePeople", people); // update just this client
    });

    socket.on("customReconnect", function (id) {
        var person = _.findWhere(people, {
            id: id
        });
        if (person && person.disconnected) {
            person.disconnected = false;
            player = person;
            io.emit("updatePeople", people);
            socket.emit("joined", player);
        } else {
            socket.emit("userError", "Cannot reconnect");
        }
    });

    socket.on("join", function (name) { // TODO pass id and use existing player if possible. For reconnects
        if (gameEngine == null) {
            player = new Player(name);
            people.push(player);
            io.emit("updatePeople", people);
            socket.emit("joined", player);
        } else {
            socket.emit("userError", "Cannot join game in progress");
        }
    });

    socket.on("requestStart", function () {
        gameEngine = new $engine.Engine(people);
        io.emit("begin", people); // emit necessary data here
    });

    socket.on("kick", function (id) {
        var index = _.findIndex(people, function (p) {
            return p.id == id;
        });
        var person = people[index];
        if (person && person.disconnected && !gameEngine) {
            people.splice(index, 1);
            socket.emit("updatePeople", people);
        }
    });

    socket.on('disconnect', function(){
        if (player) {
            player.disconnected = true;
            socket.emit("updatePeople", people);
        }
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
