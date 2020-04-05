import {range, sfc32} from './utils.js';
import Game from './game.js';



const Bot = {
    seed: 0,

    findBestMoves(game, depth) { /* : [number[], number] */
        return _findBestMoves(game, depth);
        function _findBestMoves(
            game,
            depth,
            tryhard = true,
        ) {
            const preRes = range(game.grid.length).map(i => {
                const r = Game.play(game, i);
                if (r === false) return undefined;
                try {
                    if (r === 'win') return 1;
                    else if (r === 'draw') return 0;
                    else if (r === 'legal') return depth <= 0 ? 0 : -_findBestMoves(game, depth - 1, !tryhard)[1];
                    else throw new Error(`Illegal return value ${r}`);
                } finally {
                    if (!Game.takeback(game)) throw new Error(`Can't takeback move`);
                }
            });
    
            const legalMoves = range(game.grid.length).filter(i => preRes[i] !== undefined);
            
            const res = legalMoves.map(i => preRes[i]);
            //console.log(Game.copy(game), depth, tryhard, legalMoves, res);
    
            const bestScore = Math.max(...res);
            const bestMoves = legalMoves.filter(i => preRes[i] >= bestScore);
            if (tryhard || bestScore > 0) return [bestMoves, bestScore, {legalMoves, res}];
    
            return [legalMoves, res.reduce((a, b) => a + b, 0) / res.length];
        }
    },

    findBestMove(game, depth) {
        const returned = this.findBestMoves(game, depth);
        console.log(`Best move:`, returned);
        const moves = returned[0].sort();
        if (moves.length <= 0) {
            console.error(`No moves for gamestate!`, Game.copy(game));
            throw new Error(`No moves for gamestate!`);
        }
        const random = sfc32(game.turns.length + Bot.seed, 3 * game.turns.length, 5 * game.turns.length + 11 * Bot.seed, 7 * game.turns.length);
        for (let i = 0; i < 10; i++) {
            random(); // make sure state is random
        }
        return moves[range(moves.length - 1).reduce(a => a + (random() < 0.5), 0)];
    },
};
export default Bot;
