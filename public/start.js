
define(["gameRenderer", "stateManager"], function (GameRenderer, StateManager) {
    $(document).ready(function () {
        var stateManager = new StateManager();
        var renderer = new GameRenderer(stateManager);
    });
});