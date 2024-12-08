const flexShuffle = new FlexShuffle(document.getElementById('flex-shuffle'));

const shuffleBtns = document.getElementsByClassName('shuffle-btn');

for (var i = 0; i < shuffleBtns.length; i++) {
    shuffleBtns[i].addEventListener('click', (e) => {
        flexShuffle.filter(e.target.dataset.filter);
    });
}