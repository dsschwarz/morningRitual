var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require("underscore");
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var assert = require("assert");
var session = require('express-session');
var flash = require('connect-flash');

var rooms = require("./server/roomService");
var gameRoutes = require("./routes/game");
var lobbyRoutes = require("./routes/lobby");
var indexRoute = require("./routes/index");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(session({secret: '{secret}', name: 'session_id', saveUninitialized: true, resave: true}));
app.use(flash());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

var lobbyManager = new rooms.LobbyManager();
var gameManager = new rooms.GameManager();
var roomService = new rooms.RoomService(lobbyManager, gameManager, io);

app.use('/', indexRoute(roomService));
app.use('/game', gameRoutes(roomService));
app.use('/lobby', lobbyRoutes(roomService));

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
