define(["d3"], function (d3) {
    var CARD_WIDTH = 50;
    var CARD_HEIGHT = 50;

    var tileLocation = {
        getCardX: function (d) {
            return d.column*CARD_WIDTH;
        },

        getCardY: function (d) {
            return d.row*CARD_HEIGHT;
        }
    };

    var GameRenderer = function (stateManager) {
        this.stateManager = stateManager;
        this.registerListeners();
    };
    GameRenderer.prototype.render = function () {
        this.renderOpenArea();

        this.renderPlayerArea();
    };

    GameRenderer.prototype.renderOpenArea = function() {
        var cards = this.stateManager.getGame().getOpenTiles();

        var commonArea = d3.select("#common-area")
            .classed("selectable", this.stateManager.getState().isOpenAreaSelectable);

        var cardContainer = commonArea
            .select(".card-container");

        var getCardX = function(d, index) {
            return index*(CARD_WIDTH + 10);
        };
        var getCardY = function(d) {
            return 10;
        };

        this.renderCards(cardContainer, cards, getCardX, getCardY);
    };

    GameRenderer.prototype.renderPlayerArea = function () {
        var game = this.stateManager.getGame();
        var currentState = this.stateManager.getState();
        var cards = game.getPlayerEngine().getCards();

        var machineArea = d3.select("#machine-area")
            .classed("selectable", currentState.playerAreaIsSelectable && game.showingMyArea());
        var cardContainer = machineArea
            .select(".card-container");

        this.renderCards(cardContainer, cards, tileLocation.getCardX, tileLocation.getCardY);
    };

    GameRenderer.prototype.renderCards = function (d3parentElement, cardData, x, y, additionalClass) {
        var that = this;
        var cards = d3parentElement
            .selectAll(".card" + (additionalClass ? "."+additionalClass : ""))
            .data(cardData);
        var newCards = cards.enter().append("g")
            .classed("card", true)
            .classed(additionalClass, _.isString(additionalClass))
            .on("click", function cardClickHandler(card) {
                that.stateManager.getState().onCardSelect(card);
                d3.event.stopPropagation();
            });

        newCards.append("image")
            .classed("card-image", true)
            .attr("width", CARD_WIDTH)
            .attr("height", CARD_HEIGHT);

        cards
            .classed("selectable", function (d) {
                var currentState = that.stateManager.getState();
                return currentState.selectableCard && currentState.selectableCard(d);
            })
            .attr("transform", function (d) {
                return "translate(" + x.apply(this, arguments) + "," + y.apply(this, arguments) + ")";
            });

        cards.select(".card-image")
            .attr("xlink:href", function (d) {
                return "data:image/png;base64" + d.imageData;
            });

        cards.exit().remove();
    };

    GameRenderer.prototype.updatePeopleList = function(newPeople) {
        var that = this;
        var container = $(".player-list").empty();

        _.each(newPeople, function (person, i) {
            var personContainer = $("<div>")
                .addClass("player")
                .toggleClass("primary", person.id == that.stateManager.getCurrentPlayerId())
                .toggleClass("disconnected", !!person.disconnected)
                .appendTo(container);

            $("<span>")
                .addClass("player-name")
                .text(person.name)
                .appendTo(personContainer);

            $("<button>")
                .addClass("btn stage3")
                .text("Show Machine")
                .click(function () {
                    game.showMachine(person);
                    gameInterface.render();
                })
                .appendTo(personContainer);
            //
            // $("<button>")
            //     .addClass("btn kickPlayer stage2")
            //     .text("Kick")
            //     .click(function () {
            //         socket.emit("kick", person.id);
            //     })
            //     .appendTo(personContainer);
        });
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
        d3.select("#common-area")
            .on("click", function () {
                if (that.stateManager.getState().onCommonAreaSelect) {
                    that.stateManager.getState().onCommonAreaSelect();
                    d3.event.stopPropagation();
                }
            })
            .on("mousemove", function () {
                if (that.stateManager.getState().currentCard) {
                    var card = that.stateManager.getState().currentCard();
                    var x = d3.event.x - this.getBoundingClientRect().left;
                    var y = d3.event.y - this.getBoundingClientRect().top;

                    var getCardX = function () {
                        return x;
                    };
                    var getCardY = function () {
                        return y;
                    };

                    that.renderCards(d3.select("#common-area"), [card], getCardX, getCardY, "preview")
                }
            })
            .on("mouseleave", function () {
                d3.select("#common-area").select(".preview").remove();
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

                that.renderCards(machineAreaHelpers.element(), [tile], tileLocation.getCardX, tileLocation.getCardY, "preview")
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