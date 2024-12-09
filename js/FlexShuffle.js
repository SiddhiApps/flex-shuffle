class FlexShuffle {
    constructor(element, options = {}) {
        this._items = element.children;
        this._visibleItems = [];
        this._hiddenItems = [];

        this._itemWidth = this._items[0].clientWidth;
        this._itemHeight = this._items[0].clientHeight;

        this._flexPositions = new FlexPositions(element);
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
            let currentPosition = this._getPosition(this._items[this._visibleItems[i]]);
            // Find the new position based on the width and margins
            // TODO: It is a challenge based on the justify content value
            let newPosition = this._flexPositions.getPosition(i, this._visibleItems.length);

            let transform = {
                type: 'show',
                element: this._items[this._visibleItems[i]],
                order: i + 1,
                keyframes: this._getTranslateAnimation(currentPosition, newPosition)
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

            // if (transform.type == 'hide') {
            //     animationTiming.fill = 'forwards';
            // } else {
            //     delete animationTiming.fill;
            // }

            let animation = transform.element.animate(transform.keyframes, animationTiming)
            animation.ready.then(() => {
                                if (transform.type == 'show') {
                                    // We just need to remove the 'none' value
                                    // transform.element.style.display = '';
                                    transform.element.style.zIndex = '';
                                    transform.element.style.opacity = '';
                                }
                            });
            animation.finished.then(() => {
                                if (transform.type == 'hide') {
                                    // transform.element.style.display = 'none';
                                    transform.element.style.position = 'absolute';
                                    transform.element.style.zIndex = -1;
                                    transform.element.style.opacity = 0;
                                } else {
                                    transform.element.style.position = '';
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
        this._hiddenItems = [];
        const filters = filterBy.split(/[\|\&]/);

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

    _getTranslateAnimation(currentPosition, newPosition) {
        let translateX = parseFloat(newPosition.x) - parseFloat(currentPosition.x);
        let translateY = parseFloat(newPosition.y) - parseFloat(currentPosition.y);

        // Translate from original position to new position
        return [
            { transform: 'translate(0)' },
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