define([
    "gameInterface/states/defaultState",
    "gameInterface/states/placingTile",
    "gameInterface/states/takingTile"
], function (DefaultState, placingTile, TakingTile) {
    return {
        "DefaultState": DefaultState,
        "PlacingGoalTile": placingTile.PlacingGoalTile,
        "PlacingOrdinaryTile": placingTile.PlacingOrdinaryTile,
        "TakingTile": TakingTile
    }
});