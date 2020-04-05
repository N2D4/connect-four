import socketio from 'socket.io-client';
import "regenerator-runtime/runtime.js";

setTimeout(async () => {
    const socket = socketio();
    socket.on('alert', (...args) => alert(...args));
    socket.on('reload', () => location.reload(true));
    
    let gameId;
    while (true) {
        gameId = prompt('Please enter a game ID');
        if (gameId) break;
        alert(`Please enter an ID!`);
        await wait(500);
    }
    socket.emit('ljoin', String(gameId), 5, 6, 2);



}, 500);


async function wait(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}