define([
    "states/defaultState",
    "states/placingTile",
    "states/takingTile"
], function (DefaultState, placingTile, TakingTile) {
    return {
        "DefaultState": DefaultState,
        "PlacingGoalTile": placingTile.PlacingGoalTile,
        "PlacingOrdinaryTile": placingTile.PlacingOrdinaryTile,
        "TakingTile": TakingTile
    }
});