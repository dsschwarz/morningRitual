define(["imageData"], function (imageData) {
    var CARD_WIDTH = 50;
    var CARD_HEIGHT = 50;

    var tileLocation = {
        getTileX: function (d) {
            return d.column*CARD_WIDTH;
        },

        getTileY: function (d) {
            return d.row*CARD_HEIGHT;
        }
    };

    var GameRenderer = function (stateManager) {
        var that = this;
        this.stateManager = stateManager;
        this.currentPlayerId = stateManager.getCurrentPlayerId();
        stateManager.onChange(function () {
            that.render();
            console.log("Re-renderer")
        });
        this.registerListeners();
        this.render();
    };
    GameRenderer.prototype.render = function () {
        this.renderOpenArea();

        this.renderPlayerArea();
    };

    GameRenderer.prototype.renderOpenArea = function() {
        var tiles = this.stateManager.getGame().getOpenTiles();

        var openArea = d3.select("#open-area")
            .classed("selectable", this.stateManager.getState().openAreaIsSelectable);

        var tileContainer = openArea
            .select(".tile-container");

        var getTileX = function(d, index) {
            return index*(CARD_WIDTH + 10);
        };
        var getTileY = function(d) {
            return 10;
        };

        this.renderTiles(tileContainer, tiles, getTileX, getTileY);
    };

    GameRenderer.prototype.renderGoalArea = function() {
        var tiles = this.stateManager.getGame().getGoalTiles();

        var goalArea = d3.select("#goal-area")
            .classed("selectable", this.stateManager.getState().goalAreaIsSelectable);

        var tileContainer = goalArea
            .select(".tile-container");

        var getTileX = function(d, index) {
            return index*(CARD_WIDTH + 10);
        };
        var getTileY = function(d) {
            return 10;
        };

        this.renderTiles(tileContainer, tiles, getTileX, getTileY);
    };



    GameRenderer.prototype.renderPlayerArea = function () {
        var game = this.stateManager.getGame();
        var currentState = this.stateManager.getState();
        var tiles = game.getPlayerArea(this.currentPlayerId).getTiles();

        var machineArea = d3.select("#machine-area")
            .classed("selectable", currentState.playerAreaIsSelectable && game.showingMyArea());
        var tileContainer = machineArea
            .select(".tile-container");

        this.renderTiles(tileContainer, tiles, tileLocation.getTileX, tileLocation.getTileY);
    };

    GameRenderer.prototype.renderTiles = function (d3parentElement, tileData, x, y, additionalClass) {
        var that = this;
        var tiles = d3parentElement
            .selectAll(".tile" + (additionalClass ? "."+additionalClass : ""))
            .data(tileData);
        var newTiles = tiles.enter().append("g")
            .classed("tile", true)
            .classed(additionalClass, _.isString(additionalClass))
            .on("click", function tileClickHandler(tile) {
                that.stateManager.getState().selectTile(tile);
                d3.event.stopPropagation();
            });

        newTiles.append("image")
            .classed("tile-image", true)
            .attr("width", CARD_WIDTH)
            .attr("height", CARD_HEIGHT);

        tiles
            .classed("selectable", function (d) {
                var currentState = that.stateManager.getState();
                return currentState.isTileSelectable(d);
            })
            .attr("transform", function (d) {
                return "translate(" + x.apply(this, arguments) + "," + y.apply(this, arguments) + ")";
            });

        tiles.select(".tile-image")
            .attr("xlink:href", function (d) {
                if (imageData[d.imageId]) {
                    return "data:image/png;base64" + imageData[d.imageId];
                } else {
                    console.warn("Invalid image id - " + d.imageId);
                    return;
                }
            });

        tiles.exit().remove();
    };

    GameRenderer.prototype.registerListeners = function () {
        var that = this;
        var machineAreaHelpers = {
            element: function () {
                return d3.select("#machine-area")
            },
            getRow: function (y) { // y is event location relative to page
                return Math.floor((y - machineAreaHelpers.element().node().getBoundingClientRect().top) / CARD_HEIGHT)
            },
            getColumn: function (x) { // x is event location relative to page
                return Math.floor((x - machineAreaHelpers.element().node().getBoundingClientRect().left) / CARD_WIDTH)
            }
        };

        this.registerDeckListener();
        // BINDINGS
        d3.select("#open-area")
            .on("click", function () {
                that.stateManager.getState().selectOpenArea();
                d3.event.stopPropagation();
            });
        d3.select("#goal-area")
            .on("click", function () {
                that.stateManager.getState().selectGoalArea();
                d3.event.stopPropagation();
            });

        d3.select(".show-smooth-preview")
            .on("mousemove", function () {
                var heldTile = that.stateManager.getPlayerTile();
                if (heldTile) {
                    var x = d3.event.x - this.getBoundingClientRect().left;
                    var y = d3.event.y - this.getBoundingClientRect().top;

                    var getTileX = function () {
                        return x;
                    };
                    var getTileY = function () {
                        return y;
                    };

                    that.renderTiles(d3.select("#open-area"), [heldTile], getTileX, getTileY, "preview")
                }
            })
            .on("mouseleave", function () {
                d3.select("#open-area").select(".preview").remove();
            });

        machineAreaHelpers.element().on("click", function () {
            if (that.stateManager.getGame().showingMyArea()) {
                that.stateManager.getState().selectPlayerArea(
                    machineAreaHelpers.getRow(d3.event.y),
                    machineAreaHelpers.getColumn(d3.event.x)
                );
                d3.event.stopPropagation();
            }
        }).on("mousemove", function () {
            var tile = that.stateManager.getPlayerTile();
            if (tile && that.stateManager.getGame().showingMyArea()) {
                tile.row = machineAreaHelpers.getRow(d3.event.y);
                tile.column = machineAreaHelpers.getColumn(d3.event.x);

                that.renderTiles(machineAreaHelpers.element(), [tile], tileLocation.getTileX, tileLocation.getTileY, "preview")
            }
        }).on("mouseleave", function () {
            d3.select("#machine-area").select(".preview").remove();
        });


        $(document).keyup(function (event) {
            var keyCode = event.keyCode;
            if (keyCode == 27) {
                // cancel
                that.stateManager.getState().cancel();
            }
        });
    };

    GameRenderer.prototype.registerDeckListener = function () {
        var that = this;

        // replace with an image later?
        $(".deckButton").click(function deckClickHandler() {
            that.stateManager.getState().selectDeck();
        });
    };

    return GameRenderer;
});