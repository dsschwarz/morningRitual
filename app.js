var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require("underscore");
var path = require('path');
var assert = require("assert");
var rooms = require("./server/roomService");
var gameRoutes = require("./routes/game");
var indexRoute = require("./routes/index");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static('public'));

var lobbyManager = new rooms.LobbyManager(io);
var gameManager = new rooms.GameManager(io);
var roomService = new rooms.RoomService(lobbyManager, gameManager);

app.use('/', indexRoute(roomService));
app.use('/game', gameRoutes(roomService));

io.on('connection', function(socket) {
    var cachedPlayerId = null;
    socket.on("connectLobby", function (playerId, lobbyId) {
        cachedPlayerId = playerId;
        lobbyManager.connectPlayer(playerId, lobbyId, socket);
    });

    socket.on("connectGame", function (playerId, gameId) {
        cachedPlayerId = playerId;
        gameManager.connectPlayer(playerId, gameId, socket);
    });

    socket.on('disconnect', function(){
        roomService.disconnectPlayer(cachedPlayerId);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
