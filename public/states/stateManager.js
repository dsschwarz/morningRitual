define(["lib/d3", "states/allStates", "Game"], function (d3, allStates, Game) {
    function StateManager(initialState, gameNetworkingService) {
        var that;
        this.game = new Game(initialState);
        this.networking = gameNetworkingService;
        this.networking.onGameStateChange(this.handleGameStateChange.bind(this));
        this._onChangeCallbacks = [];
        this.goToState("DefaultState");
        return this;
    }

    StateManager.prototype.onChange = function(callback) {
        this._onChangeCallbacks.push(callback);
    };

    StateManager.prototype.handleGameStateChange = function (newState) {
        this.game = new Game(newState);
        this._triggerChange();
    };

    StateManager.prototype._triggerChange = function () {
        this._onChangeCallbacks.forEach(function (callback) {
            callback.call();
        })
    };

    StateManager.prototype.goToState = function (name) {
        d3.select(".preview").remove(); // clear all previews
        var givenArguments = Array.prototype.slice.call(arguments, 1);
        givenArguments.unshift(this);
        givenArguments.unshift(null);
        var constructor = Function.prototype.bind.apply(allStates[name], givenArguments);
        this.currentState = new constructor;
        this._triggerChange();
    };

    StateManager.prototype.getState = function () {
        return this.currentState;
    };

    StateManager.prototype.getGame = function () {
        return this.game;
    };

    StateManager.prototype.getPlayerTile = function () {
        return this.game.getPlayerArea(this.getCurrentPlayerId()).heldTile;
    };

    StateManager.prototype.getCurrentPlayerId = function () {
        return this.networking.playerId;
    };

    return StateManager;
});
