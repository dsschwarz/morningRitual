var util = require("./util");

function Player(name) {
    this.id = util.getId();
    this.name = name;
}

module.exports = Player;