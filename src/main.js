import express from 'express';
import path from 'path';
import socketio from 'socket.io';
import "regenerator-runtime/runtime.js";
import Game from './game.js';

const validGameIDs = ['abc', 'test', 'admin', 'cool', 'these', 'are', 'random', 'names', '1337', 'multiplayer'].concat([...new Array(100).keys()].map((_, i) => `l${i}`));

const games = new Map(); // <string, [[socket | null, socket | null], Game]>

const app = express();
const httpServer = require('http').createServer(app);
const io = socketio.listen(httpServer);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.sendFile(path.resolve(process.cwd(), 'src/client.html')));
app.get('/client.js', (req, res) => res.sendFile(path.resolve(process.cwd(), 'out/client_bundle.js')));

io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);

    function emit(msg, ...data) {
        socket.emit(msg, ...data);
    }

    function on(msg, cb) {
        return socket.on(msg, (...args) => {
            try {
                cb(...args);
            } catch (e) {
                console.error(`Error! Socket: ${socket.id}`, e);
            }
        })
    }

    function msg(str) {
        emit('alert', str);
    }

    function err(str) {
        msg(str);
        emit('reload');
        throw new Error(`Client error: ${str}`);
    }

    let id;

    on('disconnect', () => {
        console.log(`Socket disconnected ${socket.id}`);
        const game = games.get(id);
        if (game) game[0] = game[0].map(a => a === socket ? null : a);
    });

    on('chat', (msg) => {
        if (typeof msg !== 'string') err(`Type should be string!`);
        if (msg.length > 50) err(`This message is too long!`);

        const game = games.get(id);
        if (!game) err(`You can't chat while not in a game!`);
        const color = game[1].colors[game[0].indexOf(socket)];

        for (const s of game[0].filter(a => a)) {
            s.emit('chat', color, msg);
        }
    });

    on('ljoin', (data) => {
        if (typeof data !== 'string') err(`id not string: ${id}`);
        if (!validGameIDs.includes(data)) return msg(`This game ID is not valid!`);

        id = data;
        if (!games.has(id)) games.set(id, [[null, null], Game.newGame()]);
        const game = games.get(id);
        game[0] = game[0].map(s => s !== null && s.connected ? s : null);

        if (!game[0].includes(socket)) {
            if (game[0][0]) {
                if (game[0][1]) {
                    return msg(`This game is already full!`);
                }
                game[0][1] = socket;
            } else {
                game[0][0] = socket;
            }
            for (const s of game[0]) {
                if (s === socket || s === null) continue;
                s.emit('alert', 'A player joined your game!');
            }
        }

        for (const s of game[0].filter(a => a)) {
            update(s, game[1]);
        }
    });

    on('play', (where) => {
        if (!Number.isInteger(where)) err(`Invalid type!`);

        const game = games.get(id);
        if (!game) err(`You're not in a game!`);

        const color = game[1].colors[game[0].indexOf(socket)];
        if (color !== Game.nextColor(game[1])) return;
        const res = Game.play(game[1], where);

        if (!res) {
            update(socket, game[1]);
        }

        for (const s of game[0].filter(a => a)) {
            if (res) {
                update(s, game[1]);
            }
        }

        if (res === 'win' || res === 'draw') {
            for (const s of game[0].filter(a => a)) {
                s.emit('game-result', color, res);
            }
            const oldGame = game[1];
            setTimeout(() => {
                if (games.get(id) !== game || game[1] !== oldGame) return;
                game[0].push(game[0].shift());
                game[1] = Game.newGame();

                for (const s of game[0].filter(a => a)) {
                    update(s, game[1]);
                }
            }, 5000);
        }
    });
});

httpServer.listen(port, () => console.log(`Connect Four listening at http://localhost:${port}`));



function update(socket, game) {
    socket.emit('update', game);
}


