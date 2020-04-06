import {range, sfc32, shuffle} from './utils.js';
import Game from './game.js';



const Bot = {
    seed: 0,

    findBestMoves(game, minDepth, satisfactionThreshold, satThresDepth) { /* : [number[], number] */
        let totalCalls = 0;
        let res = [null, -2];
        while (true) {
            res = _findBestMoves(game, minDepth, satisfactionThreshold, satThresDepth);
            if (totalCalls >= 50000 || Math.abs(res[1]) >= 1) break;
            console.log(`Increasing minDepth from ${minDepth} to ${minDepth + 1} (calls: ${totalCalls})`);
            minDepth++;
        }
        console.log(`Total calls: ${totalCalls}`);
        return res;
        function _findBestMoves(
            game,
            minDepth,
            satisfactionThreshold,
            satThresDepth,
            satisfactionThresholdB = 1,
            tryhard = true,
        ) {
            totalCalls++;
            let isSatisfied = false;
            const preRes = /*shuffle*/(range(game.grid.length)).map(i => {
                if (isSatisfied) return -2;
                const r = (() => {
                    const r = Game.play(game, i);
                    if (r === false) return undefined;
                    try {
                        if (r === 'win') return 1;
                        else if (r === 'draw') return 0;
                        else if (r === 'legal') return minDepth <= 0 ? 0 : -_findBestMoves(game, minDepth - 1, satisfactionThresholdB, satThresDepth, satisfactionThreshold, !tryhard)[1];
                        else throw new Error(`Illegal return value ${r}`);
                    } finally {
                        if (!Game.takeback(game)) throw new Error(`Can't takeback move`);
                    }

                })();
                if (r >= (minDepth > satThresDepth ? 1 : satisfactionThreshold)) isSatisfied = true;
                return [r, i]
            }).sort((a, b) => a[1] - b[1]).map(a => a[0]);
    
            const legalMoves = range(game.grid.length).filter(i => preRes[i] !== undefined);
            
            const res = legalMoves.map(i => preRes[i]);
            //console.log(Game.copy(game), minDepth, tryhard, legalMoves, res);
    
            const bestScore = Math.max(...res);
            const bestMoves = legalMoves.filter(i => preRes[i] >= bestScore);
            if (tryhard || bestScore > 0) return [bestMoves, bestScore];
    
            return [legalMoves, res.reduce((a, b) => a + b, 0) / res.length];
        }
    },

    findBestMove(game, minDepth, satisfactionThreshold = 1, satThresDepth = 3) {
        const returned = this.findBestMoves(game, minDepth, satisfactionThreshold, satThresDepth);
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
