/**
 * The basic definition of a card
 * @param definition The json definition of the card
 * @returns {Card}
 * @constructor
 */
function Card(dto) {
    this.id = dto.id;
    this.imageData = dto.imageData;

    this.getName = function () {
        return dto.name;
    };

    return this;
}
