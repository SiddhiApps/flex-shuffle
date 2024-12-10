// There is still jumping effect of the flex container
// May be we can absolutely position the hidden elements before hiding them?
class FlexShuffle {
    constructor(element, options = {}) {
        this._items = element.children;
        this._visibleItems = [];
        this._hiddenItems = [];

        this._itemWidth = this._items[0].clientWidth;
        this._itemHeight = this._items[0].clientHeight;

        this._flexPositions = new FlexPositions(element);

        for (var i = 0; i < this._items.length; i++) {
            this._items[i].style.order = i + 1;
        }
    }

    _shuffle() {
        let transforms = [];
        for (var i = 0; i < this._hiddenItems.length; i++) {
            let transform = {
                type: 'hide',
                element: this._items[this._hiddenItems[i]],
                order: this._visibleItems.length + (i + 1),
                keyframes: this._getHideAnimation()
            }

            transforms.push(transform);
        }

        for (var i = 0; i < this._visibleItems.length; i++) {
            let currentPosition = this._flexPositions.getPosition(
                                    this._items[this._visibleItems[i]].style.order - 1,
                                    this._visibleItems.length
                                );
            // Find the new position based on the width and margins
            // TODO: It is a challenge based on the justify content value
            let newPosition = this._flexPositions.getPosition(i, this._visibleItems.length);

            let currentHidden = this._items[this._visibleItems[i]].style.display === 'none';
            let transform = {
                type: 'show',
                element: this._items[this._visibleItems[i]],
                order: i + 1,
                keyframes: this._getTranslateAnimation(currentPosition, newPosition, currentHidden)
            }

            transforms.push(transform);
        }

        this._performAnimations(transforms);
        // Get the column positions
        // Translate
    }

    _performAnimations(transforms) {
        let animationTiming = {
            duration: 500
        }

        for (var i = 0; i < transforms.length; i++) {
            let transform = transforms[i];

            let animation = transform.element.animate(transform.keyframes, animationTiming)
            animation.ready.then(() => {
                                if (transform.type == 'show') {
                                    // We just need to remove the 'none' value
                                    transform.element.style.display = '';
                                }
                            });
            animation.finished.then(() => {
                                if (transform.type == 'hide') {
                                    transform.element.style.display = 'none';
                                }

                                transform.element.style.order = transform.order;
                            });
        }
    }

    _getItemGroups(element) {
        return element.dataset.groups
                    .split(',')
                    .map((group) => {
                        return group.trim().toLowerCase();
                    });
    }

    filter(filterBy) {
        this._visibleItems = [];
        let currentHiddenItems = [...this._hiddenItems];
        this._hiddenItems = [];
        const filters = filterBy.split(/[\|\&]/);

        if (filters[0] == 'all') {
            for (var i = 0; i < this._items.length; i++) {
                this._visibleItems.push(i);
            }
        } else {
            for (var i = 0; i < this._items.length; i++) {
                let itemGroups = this._getItemGroups(this._items.item(i));
                let shouldBeShown = itemGroups.some((itemGroup) => {
                    return filters.includes(itemGroup);
                });

                if (shouldBeShown) {
                    this._visibleItems.push(i);
                } else {
                    this._hiddenItems.push(i);
                }
            }
        }

        // Reorder the hidden items. When the hidden items are shown
        // and animated we need to get the correct coordinates of the hidden item.
        // For example if items with order 6, 7 and 8 are currently hidden and in the
        // next shuffle item with order 7 continues to be hidden, then we need to get
        // the correct coordinates for the item with order 8.
        // Order [6, 7, 8] will become [6, 8, 7]
        currentHiddenItems.sort((x, y) => {
            return this._hiddenItems.includes(y)  ? -1 : 0;
        });

        let previousVisibleItemsCount = this._items.length - currentHiddenItems.length;
        for (var i = 0; i < currentHiddenItems.length; i++) {
            this._items[currentHiddenItems[i]].style.order = previousVisibleItemsCount + (i + 1);
        }

        this._shuffle();
    }

    _getVisibleItemPosition(i) {
        let firstElementPosition = {x: 8, y: 112};

        return {
            x: firstElementPosition.x + ((i % 4) * 212),
            y: firstElementPosition.y + (parseInt(i / 4) * 212)
        }
    }

    _getPosition(element) {
        return {x: element.getBoundingClientRect().x, y: element.getBoundingClientRect().y};
    }

    _getTranslateAnimation(currentPosition, newPosition, currentHidden) {
        let translateX = parseFloat(newPosition.x) - parseFloat(currentPosition.x);
        let translateY = parseFloat(newPosition.y) - parseFloat(currentPosition.y);

        if (currentHidden) {
            return [
                { transform: 'translate('+ translateX +'px, '+ translateY +'px) ' + (currentHidden ? 'scale(0.01)' : '') },
                { transform: 'translate('+ translateX +'px, '+ translateY +'px)' }
            ];
        }

        // Translate from original position to new position
        return [
            { transform: 'translate(0) ' + (currentHidden ? 'scale(0.01)' : '') },
            { transform: 'translate('+ translateX +'px, '+ translateY +'px)' }
        ];
    }

    _getHideAnimation() {
        // Translate from original position to new position
        return [
            { transform: 'scale(1)' },
            { transform: 'scale(0.01)' }
        ];
    }
}