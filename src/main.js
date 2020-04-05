import express from 'express';
import path from 'path';
import socketio from 'socket.io';
import "regenerator-runtime/runtime.js";

const validGameIDs = ['abc', 'test', 'admin', 'cool', 'these', 'are', 'random', 'names', 'Pogey'];

const games = new Map(); // <string, [[socket, socket], ('red' | 'yellow' | null)[][]]>

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

    on('ljoin', (id, ...args) => {
        if (typeof id !== 'string') throw new Error(`id not string: ${id}`);
        if (!validGameIDs.includes(id)) err(`This game ID is not valid!`);
        err(`unimpl`);
    })
});

httpServer.listen(port, () => console.log(`Connect Four listening at http://localhost:${port}`));



