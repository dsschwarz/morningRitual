/**
 * Created by dan-s on 30/01/2016.
 */

function Game(players) {
    this.engine = new Engine(players);
    this.players = players;

    this.currentPlayer = function () {
        return this.players[0];
    };

    this.endTurn = function () {
        this.engine.fillOpenArea();
    };
}

function GameInterface(game) {
    var gameInterface = this;
    var cardWidth = 120;
    var cardHeight = 170;

    var goToState = function (name) {
        currentState = states[name].apply(null, Array.prototype.slice.call(arguments, 1));
        gameInterface.draw();
    };

    var defaultEndTurn = function () {
        game.endTurn();
        goToState("ChooseAction");
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
                }
            };
            return actions;
        },
        PlaceCardFromCommonArea: function (card) {
            return {
                onMachineAreaSelect: function (x, y) {
                    card.x = x;
                    card.y = y;
                    game.engine.moveCardToMachine(game.currentPlayer(), card);
                    goToState("ConnectPorts")
                },
                onCommonAreaSelect: function () {
                    goToState("ChooseAction")
                },
                onSlotSelect: function (slotNumber) {
                    // add to slot
                },
                cancel: function () {
                    goToState("ChooseAction");
                }
            }
        },
        ConnectPorts: function () {
            // connect any valid ports
            var actions = {
                selectablePort: function (port) {
                    var cards = game.engine.getPlayerItems(game.currentPlayer());
                    var connections = game.engine.getPlayerEngine(game.currentPlayer())._connections;

                    var freePort = !_.some(connections, function (connection) {
                        return connection.hasPort(port);
                    });
                    return freePort && _.some(cards, function (card) {
                        return _.contains(card.inputs.concat(card.outputs), port);
                    });
                },
                onPortSelect: function (port) {
                    if (!actions.selectablePort(port)) {
                        console.warn("Invalid ports");
                    } else {
                        goToState("ConnectPort", port)
                    }
                },
                endTurn: defaultEndTurn
            };
            return actions;
        },
        ConnectPort: function (port) {
            // connect port to a valid port
            var actions = {
                selectablePort: function (otherPort) {
                    var cards = game.engine.getPlayerItems(game.currentPlayer());
                    var pEngine = game.engine.getPlayerEngine(game.currentPlayer());
                    var connections = pEngine._connections;

                    var validConnection = pEngine.validConnection(port, otherPort);
                    var belongsToPlayer = _.some(cards, function (card) {
                        return _.contains(card.inputs.concat(card.outputs), otherPort);
                    });
                    var freePort = !_.some(connections, function (connection) {
                        return connection.hasPort(otherPort);
                    });
                    return freePort && belongsToPlayer && validConnection;
                },
                onPortSelect: function (selectedPort) {
                    if (!actions.selectablePort(selectedPort)) {
                        console.warn("Invalid ports");
                    } else {
                        game.engine.getPlayerEngine(game.currentPlayer()).connect(port, selectedPort);
                        goToState("ConnectPorts")
                    }
                },
                cancel: function () {
                    goToState("ConnectPorts");
                },
                endTurn: defaultEndTurn
            };
            return actions;
        }
    };
    var currentState = states.ChooseAction();

    var cardClickHandler = function (card) {
        if (currentState.onCardSelect) {
            currentState.onCardSelect(card);
            d3.event.stopPropagation();
        }
    };
    var portClickHandler = function (card) {
        if (currentState.onPortSelect) {
            currentState.onPortSelect(card);
            d3.event.stopPropagation();
        }
    };

    this.drawPlayerArea = function (player) {
        var cards = game.engine.getPlayerItems(player);

        var machineArea = d3.select("#machine-area")
            .classed("selectable", currentState.onMachineAreaSelect !== undefined);
        var cardContainer = machineArea
            .select(".card-container");

        var bounds = machineArea.node().getBoundingClientRect();

        var getCardX = function (d) {
            return d.x || Math.random()*(bounds.width-cardWidth);
        };

        var getCardY = function (d) {
            return d.y || Math.random()*(bounds.height-cardHeight);
        };
        this.drawCardCollection(cardContainer, cards, getCardX, getCardY, true);

        var connections = game.engine.getPlayerEngine(player)._connections;
        connections.forEach(function (con) {
            var input = d3.select("#machine-area").selectAll(".port-label").filter(function (d) {
                return d == con.input;
            });

            console.log(input);
        })
    };

    this.drawCardCollection = function (d3parentElement, cardData, x, y, enableDrag) {
        var cards = d3parentElement
            .selectAll(".card")
            .data(cardData);
        var newCards = cards.enter().append("g")
            .classed("card", true)
            .on("click", cardClickHandler)
            .attr("transform", function (d) {
                return "translate(" + x.apply(this, arguments) + "," + y.apply(this, arguments) + ")";
            });

        if (enableDrag) {
            var drag = d3.behavior.drag();
            cards.call(drag);
            cards.on("dragend", function () {
                console.log(arguments)
            })
        }
        newCards.append("rect")
            .attr("width", cardWidth)
            .attr("height", cardHeight)
            .classed("card-back", true);
        newCards.append("text")
            .classed("title", true);
        newCards.append("g")
            .classed("inputs", true)
            .attr("transform", "translate(-10, 10)");
        newCards.append("g")
            .classed("outputs", true)
            .attr("transform", "translate(80, 10)");

        cards.classed("selectable", function (d) {
            return currentState.selectableCard && currentState.selectableCard(d);
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

        function updatePorts(portType) {
            var ports = cards.select("." + portType)
                .selectAll(".port-label")
                .data(function (cardData) {
                    return cardData ? cardData[portType] : [];
                });

            ports.enter().append("text")
                .classed("port-label", true)
                .on("click", portClickHandler);

            ports
                .classed("selectable", function (d) {
                    return currentState.selectablePort && currentState.selectablePort(d);
                })
                .attr("dy", function (d, index) {
                    return 15+index*5;
                })
                .text(function (d) {
                    return d.tags.join(" ")
                });

            ports.exit().remove();
        }

        updatePorts("inputs");
        updatePorts("outputs");

        cards.exit().remove();
    };

    this.drawOpenArea = function() {
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

        this.drawCardCollection(cardContainer, cards, getCardX, getCardY);
    };

    this.draw = function () {
        var players = game.players;
        gameInterface.drawOpenArea();

        players.forEach(function (p) {
            gameInterface.drawPlayerArea(p)
        })
    };

    d3.select("#common-area").on("click", function () {
        if (currentState.onCommonAreaSelect) {
            currentState.onCommonAreaSelect();
            d3.event.stopPropagation();
        }
    });
    d3.select("#machine-area").on("click", function () {
        if (currentState.onMachineAreaSelect) {
            currentState.onMachineAreaSelect(d3.event.x - cardWidth/2, d3.event.y-cardHeight/2-this.getBoundingClientRect().top);
            d3.event.stopPropagation();
        }
    });

    $(".nextTurnButton").click(function () {
        if (currentState.endTurn) {
            currentState.endTurn();
        }
    });

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