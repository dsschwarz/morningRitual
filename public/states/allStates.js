define([
    "states/defaultState",
    "states/placingTile",
    "states/takingTile"
], function (DefaultState, PlacingTile, TakingTile) {
    return {
        "DefaultState": DefaultState,
        "PlacingTile": PlacingTile,
        "TakingTile": TakingTile
    }
});