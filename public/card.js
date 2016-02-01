/**
 * The basic definition of a card
 * @param dto The json definition of the card
 * @returns {Card}
 * @constructor
 */
function Card(dto) {
    this.id = dto.id;
    this.imageData = dto.imageData;
    this.row = dto.row;
    this.column = dto.column;

    this.getName = function () {
        return dto.name;
    };

    return this;
}
