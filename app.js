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
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);

console.log("Connecting to database");
mongoose.connect('mongodb://localhost/morningRitual');


var RoomService = require("./server/roomService/roomService");
var gameRoutes = require("./routes/game");
var lobbyRoutes = require("./routes/lobby");
var indexRoute = require("./routes/index");
var UserService = require("./server/user/userService");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(session({
    secret: "notasecret",
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(flash());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(function (req, res, next) {
    res.locals.messages = req.flash();
    next();
});

var userService = new UserService();
var roomService = new RoomService(io);

app.use('/', indexRoute(roomService, userService));
app.use(function (req, res, next) {
    if (req.session.user == undefined) {
        req.flash("danger", "Please log in to continue");
        res.redirect("/login");
    } else {
        res.locals.username = req.session.user.username;
        next();
    }
});
app.use('/game', gameRoutes(roomService));
app.use('/lobby', lobbyRoutes(roomService, userService));

io.on('connection', function(socket) {
    var cachedPlayerId = null;
    socket.on("connectLobby", function (playerId, lobbyId) {
        cachedPlayerId = playerId;
        roomService.connectPlayer(playerId, lobbyId, socket);
    });

    socket.on("connectGame", function (playerId, gameId) {
        cachedPlayerId = playerId;
        roomService.connectPlayer(playerId, gameId, socket);
    });

    socket.on('disconnect', function(){
        roomService.disconnectPlayer(cachedPlayerId);
    });
});



var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    http.listen(3000, function() {
        console.log('listening on *:3000');
    });
});