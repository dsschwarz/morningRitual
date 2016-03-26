
$(".joinButton").click(function () {
    socket.emit("join", prompt("What's your name?"));
});

$(".beginButton").click(function () {
    socket.emit("requestStart");
});