const Game = {
    colors: ['red', 'yellow'],

    newGame(width=7, height=6, colors=['red', 'yellow'], toWin=4) {
        return {
            grid: range(7).map(_ => range(6).map(_ => 'none')),
            turnCount: 0,
            colors: [
                'red',
                'yellow'
            ],
            hasEnded: false,
            toWin: 4,
            totalCells: width * height,
        };
    },

    nextColor(game) {
        return game.colors[game.turnCount % game.colors.length];
    },

    play(game, move) { // : false | 'legal' | 'win' | 'draw'
        const color = Game.nextColor(game);
        if (game.hasEnded) return false;
        if (!Number.isInteger(move) || move < 0 || move >= game.grid.length) return false;
        let c = 0;
        while (game.grid[move][c] === 'none') c++;
        c--;
        if (c < 0) return false;
        game.grid[move][c] = color;
        game.turnCount++;

        for (let i = -1; i <= 1; i++) {
            outer: for (let j = -1; j <= 1; j++) {
                if (i == 0 && j == 0) continue;
                for (let k = 0; k < game.toWin; k++) {
                    if ((game.grid[move+k*i] && game.grid[move+k*i][c+k*j]) !== color) continue outer;
                }
                game.hasEnded = true;
                return 'win';
            }
        }

        if (game.turnCount === game.totalCells) {
            return 'draw';
        }

        return 'legal';
    }
};
export default Game;

function range(end) {
    return [...new Array(end).keys()];
}

