define(["jquery"], function ($) {
    return {
        updatePeopleList: function(newPeople, currentPlayerId, gameInterface) {
            var that = this;
            var container = $(".player-list").empty();

            if (container.length == 0) {
                throw new Error("No player-list container");
            }

            _.each(newPeople, function (person, i) {
                var personContainer = $("<div>")
                    .addClass("player")
                    .toggleClass("primary", person.id == currentPlayerId)
                    .toggleClass("disconnected", !!person.disconnected)
                    .appendTo(container);

                $("<span>")
                    .addClass("player-name")
                    .text(person.username)
                    .appendTo(personContainer);

                if (gameInterface) {
                    $("<button>")
                        .addClass("btn")
                        .text("Show Machine")
                        .click(function () {
                            gameInterface.showMachine(person._id);
                        })
                        .appendTo(personContainer);
                }
            });
        }
    };
});