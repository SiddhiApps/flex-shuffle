// Given a flex container we need to determine the positions of the 'i'th flex item.
// All factors need to be considered: justify-content, flex-direction, align-items
// Initially assume: justify-content: left, flex-direction: row

class FlexPositions {
    constructor(element) {
        this._flexContainer = element;
        this._flexItemWidth = 200;
        this._flexItemHeight = 226;
        this._gap = 12;

        this._noOfItemsInARow = parseInt(this._flexContainer.clientWidth / this._flexItemWidth);
        this._firstItemPosition = {
            x: this._flexContainer.getBoundingClientRect().x,
            y: this._flexContainer.getBoundingClientRect().y
        }
    }

    // i - the index
    // n - total items in the container
    getPosition(i, n) {
        return {
            x: this._firstItemPosition.x + (this._flexItemWidth + this._gap) * (i % this._noOfItemsInARow),
            y: this._firstItemPosition.y + (this._flexItemHeight + this._gap) * parseInt(i / this._noOfItemsInARow)
        }
    }
}