
var socket = io();
socket.once("begin", helpers.begin);
socket.once("joined", function (player) {
    $(document.body).addClass("inLobby");
    $(document.body).removeClass("outOfLobby");
    document.cookie = "playerId=" + player.id;
    helpers.setPlayer(player);
});
socket.on("userError", function (e) {
    console.error(e);
});