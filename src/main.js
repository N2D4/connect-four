import express from 'express';
import path from 'path';
import socketio from 'socket.io';
import "regenerator-runtime/runtime.js";
import Game from './game.js';

const validGameIDs = ['abc', 'test', 'admin', 'cool', 'these', 'are', 'random', 'names', '1337', 'multiplayer'].concat([...new Array(100).keys()].map((_, i) => `l${i}`));

const games = new Map(); // <string, [[socket | null, socket | null], ('red' | 'yellow' | null)[][]]>

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

    on('ljoin', (id) => {
        if (typeof id !== 'string') err(`id not string: ${id}`);
        if (!validGameIDs.includes(id)) return msg(`This game ID is not valid!`);

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
    })
});

httpServer.listen(port, () => console.log(`Connect Four listening at http://localhost:${port}`));



function update(socket, game) {
    socket.emit('update', game);
}


