/**
 * Created by dan-s on 30/01/2016.
 */

function Game(players, socket, player) {
    this.engine = new Engine(players);
    this.players = players;

    this.getPlayerEngine = function () {
        return this.engine.getPlayerEngine(player);
    };

    this.addCardToMachine = function(card, row, column) {
        socket.emit("addCardToMachine", row, column);
        this.getPlayerEngine().addCardToMachine(card, row, column);
    };

    this.addCardToOpenArea = function(card) {
        socket.emit("addCardToOpenArea");
        this.engine.openArea.addCard(card);
    };

    this.takeFromOpenArea = function (card) {
        var deferred = new $.Deferred();
        socket.once("takeFromOpenAreaResult", function (result) {
            deferred.resolve(result);
        });
        socket.emit("takeFromOpenArea", card.id);
        return deferred.promise();
    };

    this.drawCard = function () {
        var deferred = new $.Deferred();
        socket.once("cardDrawn", function (cardData) {
            var card = new Card(cardData);
            deferred.resolve(card);
        });
        socket.emit("drawCard");
        return deferred.promise();
    };
}

function GameInterface(game) {
    var gameInterface = this;
    var cardWidth = 50;
    var cardHeight = 50;

    var goToState = function (name) {
        d3.select(".preview").remove(); // clear all previews
        currentState = states[name].apply(null, Array.prototype.slice.call(arguments, 1));
        gameInterface.render();
    };


    var states = {
        ChooseAction: function () {
            var actions =  {
                selectableCard: function (card) {
                    var cards = game.engine.getOpenCards();

                    return _.some(cards, function (c) {
                        return c.id == card.id;
                    });
                },
                onCardSelect: function (card) {
                    if (!actions.selectableCard(card)) {
                        console.warn("Invalid card")
                    } else {
                        if (_.contains(game.engine.getOpenCards(), card)) {
                            goToState("ValidateOpenAreaCard", card)
                        } else {
                            console.warn("Invalid card");
                        }
                    }
                },
                onDeckSelect: function () {
                    goToState("DrawingCard");
                }
            };
            return actions;
        },
        ValidateOpenAreaCard: function (card) {
            game.takeFromOpenArea(card).then(function (result) {
                if (result) {
                    goToState("PlaceCardFromCommonArea", card);
                } else {
                    goToState("ChooseAction");
                }
            });
            return {};
        },
        DrawingCard: function () {
            game.drawCard().then(function (card) {
                goToState("PlaceCardFromDeck", card);
            });
            return {};
        },
        PlaceCardFromDeck: function (card) {
            return {
                currentCard: function () {
                    return card;
                },
                onMachineAreaSelect: function (row, column) {
                    var playerEngine = game.getPlayerEngine();
                    if (playerEngine.canPlaceCard(card, row, column)) {
                        game.addCardToMachine(card, row, column);
                        goToState("ChooseAction");
                    }
                },
                onCommonAreaSelect: function () {
                    game.addCardToOpenArea(card);
                    goToState("ChooseAction");
                },
                cancel: function () {
                    game.addCardToOpenArea(card);
                    goToState("ChooseAction");
                }
            }
        },
        PlaceCardFromCommonArea: function (card) {
            game.engine.openArea.removeCard(card);
            return {
                currentCard: function () {
                    return card;
                },
                onMachineAreaSelect: function (row, column) {
                    var playerEngine = game.getPlayerEngine();
                    if (playerEngine.canPlaceCard(card, row, column)) {
                        game.addCardToMachine(card, row, column);
                        goToState("ChooseAction");
                    }
                },
                onCommonAreaSelect: function () {
                    game.addCardToOpenArea(card);
                    goToState("ChooseAction");
                },
                cancel: function () {
                    game.addCardToOpenArea(card);
                    goToState("ChooseAction");
                }
            }
        }
    };
    var currentState = states.ChooseAction();

    // helpers
    var tileLocation = {
        getCardX: function (d) {
            return d.column*cardWidth;
        },

        getCardY: function (d) {
            return d.row*cardHeight;
        }
    };

    var machineAreaHelpers = {
        element: function () {
            return d3.select("#machine-area")
        },
        getRow: function (y) { // y is event location relative to page
            return Math.floor((y - machineAreaHelpers.element().node().getBoundingClientRect().top) / cardHeight)
        },
        getColumn: function (x) { // x is event location relative to page
            return Math.floor((x - machineAreaHelpers.element().node().getBoundingClientRect().left) / cardWidth)
        }
    };
    this.render = function () {
        var players = game.players;
        gameInterface.renderOpenArea();

        players.forEach(function (p) {
            gameInterface.renderPlayerArea(p)
        })
    };

    this.renderOpenArea = function() {
        var cards = game.engine.getOpenCards();

        var commonArea = d3.select("#common-area")
            .classed("selectable", currentState.onCommonAreaSelect !== undefined);

        var cardContainer = commonArea
            .select(".card-container");

        var getCardX = function(d, index) {
            return index*(cardWidth + 10);
        };
        var getCardY = function(d) {
            return 10;
        };

        this.renderCards(cardContainer, cards, getCardX, getCardY);
    };

    this.renderPlayerArea = function (player) {
        var cards = game.engine.getPlayerEngine(player).getCards();

        var machineArea = d3.select("#machine-area")
            .classed("selectable", currentState.onMachineAreaSelect !== undefined);
        var cardContainer = machineArea
            .select(".card-container");

        this.renderCards(cardContainer, cards, tileLocation.getCardX, tileLocation.getCardY);
    };

    this.renderCards = function (d3parentElement, cardData, x, y, additionalClass) {
        var cards = d3parentElement
            .selectAll(".card" + (additionalClass ? "."+additionalClass : ""))
            .data(cardData);
        var newCards = cards.enter().append("g")
            .classed("card", true)
            .classed(additionalClass, _.isString(additionalClass))
            .on("click", cardClickHandler);

        newCards.append("image")
            .classed("card-image", true)
            .attr("width", cardWidth)
            .attr("height", cardHeight)

        cards
            .classed("selectable", function (d) {
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

    // HANDLERS
    var cardClickHandler = function (card) {
        if (currentState.onCardSelect) {
            currentState.onCardSelect(card);
            d3.event.stopPropagation();
        }
    };
    var deckClickHandler = function () {
        if (currentState.onDeckSelect) {
            currentState.onDeckSelect();
        }
    };

    // BINDINGS
    d3.select("#common-area")
        .on("click", function () {
            if (currentState.onCommonAreaSelect) {
                currentState.onCommonAreaSelect();
                d3.event.stopPropagation();
            }
        })
        .on("mousemove", function () {
            if (currentState.currentCard) {
                var card = currentState.currentCard();
                var x = d3.event.x - this.getBoundingClientRect().left;
                var y = d3.event.y - this.getBoundingClientRect().top;

                var getCardX = function () {
                    return x;
                };
                var getCardY = function () {
                    return y;
                };

                gameInterface.renderCards(d3.select("#common-area"), [card], getCardX, getCardY, "preview")
            }
        })
        .on("mouseleave", function () {
            d3.select("#common-area").select(".preview").remove();
        });

    machineAreaHelpers.element().on("click", function () {
        if (currentState.onMachineAreaSelect) {
            currentState.onMachineAreaSelect(
                machineAreaHelpers.getRow(d3.event.y),
                machineAreaHelpers.getColumn(d3.event.x)
            );
            d3.event.stopPropagation();
        }
    }).on("mousemove", function () {
        if (currentState.currentCard) {
            var card = currentState.currentCard();
            card.row = machineAreaHelpers.getRow(d3.event.y);
            card.column = machineAreaHelpers.getColumn(d3.event.x);

            gameInterface.renderCards(machineAreaHelpers.element(), [card], tileLocation.getCardX, tileLocation.getCardY, "preview")
        }
    }).on("mouseleave", function () {
        d3.select("#machine-area").select(".preview").remove();
    });

    // replace with an image later?
    $(".deckButton").click(deckClickHandler);

    $(document).keyup(function (event) {
        var keyCode = event.keyCode;
        if (keyCode == 27) {
            // cancel
            if (currentState.cancel) {
                currentState.cancel();
            }
        }
    })
}