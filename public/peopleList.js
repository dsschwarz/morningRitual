define(["jquery"], function ($) {
    return {
        updatePeopleList: function(newPeople) {
            var that = this;
            var container = $(".player-list").empty();

            if (container.length == 0) {
                throw new Error("No player-list container");
            }

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
            });
        }
    };
});