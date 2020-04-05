import {range} from './utils.js';

function firstUsed(game, row) {
    let c = 0;
    while (game.grid[row][c] === 'none') c++;
    return c;
}

const Game = {
    colors: ['red', 'yellow'],

    newGame(width=7, height=6, colors=['red', 'yellow'], toWin=4) {
        return {
            grid: range(7).map(_ => range(6).map(_ => 'none')),
            colors: [
                'red',
                'yellow'
            ],
            hasEnded: false,
            toWin: 4,
            totalCells: width * height,
            turns: [],
        };
    },

    nextColor(game) {
        return game.colors[game.turns.length % game.colors.length];
    },

    copy(game) {
        return JSON.parse(JSON.stringify(game));
    },

    play(game, move) { // : false | 'legal' | 'win' | 'draw'
        const color = Game.nextColor(game);
        if (game.hasEnded) return false;
        if (!Number.isInteger(move) || move < 0 || move >= game.grid.length) return false;
        const c = firstUsed(game, move) - 1;
        if (c < 0) return false;
        game.grid[move][c] = color;
        game.turns.push(move);

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                outer: for (let l = 0; l < game.toWin; l++) {
                    for (let m = 0; m < game.toWin; m++) {
                        const k = m - l;
                        if ((game.grid[move+k*i] && game.grid[move+k*i][c+k*j]) !== color) continue outer;
                    }
                    game.hasEnded = true;
                    return 'win';
                }
            }
        }

        if (game.turns.length === game.totalCells) {
            return 'draw';
        }

        return 'legal';
    },

    takeback(game) {
        if (game.turns.length <= 0) return false;
        game.hasEnded = false;
        const last = game.turns.pop();
        const r = firstUsed(game, last);
        game.grid[last][r] = 'none';
        return true;
    },
};
export default Game;


