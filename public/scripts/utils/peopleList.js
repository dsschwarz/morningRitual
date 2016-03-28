define(["jquery"], function ($) {
    return {
        /**
         * A helper function to populate the list of players in a room
         * @param newPeople {User[]} The latest list of people in this room
         * @param [currentPlayerId] {String} The id of the current player. If passed, that player is highlighted
         * @param [gameRenderer] {GameRenderer} If passed, adds and binds a Show Machine button,
     *                                          to allow viewing another players handiwork
         */
        updatePeopleList: function(newPeople, currentPlayerId, gameRenderer) {
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

                if (gameRenderer) {
                    $("<button>")
                        .addClass("btn")
                        .text("Show Machine")
                        .click(function () {
                            gameRenderer.showMachine(person._id);
                        })
                        .appendTo(personContainer);
                }
            });
        }
    };
});