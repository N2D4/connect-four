export default {
    colors: ['red', 'yellow'],
    newGame() {
        return range(7).map(_ => range(6).map(_ => 'none'));
    }
};

function range(end) {
    return [...new Array(end).keys()];
}

