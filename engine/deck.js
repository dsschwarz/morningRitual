/**
 * Created by dan-s on 30/01/2016.
 */

function Deck() {
    var cards = [];
    _.each(deckList, function (number, name) {
        for (var i=0; i<number; i++) {
            cards.push(new Card(cardDefinitions[name]));
        }
    });

    cards = _.shuffle(cards);
    this.drawCard = function () {
        return cards.pop();
    };
    return this;
}

var deckList = {
    coffee: 4,
    grinder: 2,
    beanChute: 2
};

var cardDefinitions = {
    "coffee": {
        "name": "Coffee Beans",
        cardType: cardTypes.ITEM,
        inputs: [],
        "outputs": [
            "beans"
        ]
    },
    "grinder": {
        "name": "Coffee Grinder",
        cardType: cardTypes.ITEM,
        "outputs": [
            "beans ground"
        ],
        "inputs": [
            "beans"
        ]
    },
    "beanChute": {
        name: "Bean Chute",
        cardType: cardTypes.CONNECTOR,
        inputs: [
            "beans"
        ],
        outputs: [
            "beans"
        ]
    }
};