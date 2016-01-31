/**
 * Created by dan-s on 30/01/2016.
 */

function Game(players) {
    this.engine = new Engine(players);
    this.players = players;

    this.currentPlayer = function () {
        return this.players[0];
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
                            goToState("PlaceCardFromCommonArea", card)
                        }
                    }
                },
                onDeckSelect: function () {
                    goToState("PlaceCardFromDeck", game.engine.deck.drawCard());
                }
            };
            return actions;
        },
        PlaceCardFromDeck: function (card) {
            return {
                currentCard: function () {
                    return Object.create(card); // copy it
                },
                onMachineAreaSelect: function (row, column) {
                    game.engine.getPlayerEngine(game.currentPlayer()).addCardToMachine(card, row, column);
                    goToState("ChooseAction")
                },
                onCommonAreaSelect: function () {
                    game.engine.openArea.addCard(card);
                    goToState("ChooseAction");
                },
                onSlotSelect: function (slotNumber) {
                    // add to slot
                },
                cancel: function () {
                    game.engine.openArea.addCard(card);
                    goToState("ChooseAction");
                }
            }
        },
        PlaceCardFromCommonArea: function (card) {
            game.engine.openArea.removeCard(card);
            return {
                currentCard: function () {
                    return Object.create(card); // copy it
                },
                onMachineAreaSelect: function (row, column) {
                    game.engine.getPlayerEngine(game.currentPlayer()).addCardToMachine(card, row, column);
                    goToState("ChooseAction")
                },
                onCommonAreaSelect: function () {
                    game.engine.openArea.addCard(card);
                    goToState("ChooseAction");
                },
                onSlotSelect: function (slotNumber) {
                    // add to slot
                },
                cancel: function () {
                    game.engine.openArea.addCard(card);
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
        newCards.append("rect")
            .attr("width", cardWidth)
            .attr("height", cardHeight)
            .classed("card-back", true);
        newCards.append("text")
            .classed("title", true);

        cards
            .classed("selectable", function (d) {
                return currentState.selectableCard && currentState.selectableCard(d);
            })
            .attr("transform", function (d) {
                return "translate(" + x.apply(this, arguments) + "," + y.apply(this, arguments) + ")";
            });

        cards.select(".card-back")
            .attr("fill", function (d) {
                return d ? "orange" : "lightgrey";
            });

        cards.select(".title")
            .attr("dx", cardWidth/2)
            .text(function (d) {
                return d ? d.getName() : "";
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
        if (currentState.onDeckSelect && !game.engine.deck.empty()) {
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