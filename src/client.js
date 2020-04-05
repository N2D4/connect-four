import socketio from 'socket.io-client';
import "regenerator-runtime/runtime.js";
import Game from './game.js';

setTimeout(async () => {
    const socket = socketio();
    socket.on('alert', (...args) => alert(...args));
    socket.on('reload', () => location.reload(true));
    socket.on('update', updateGame);
    socket.on('disconnect', () => (alert('You disconnected!'), location.reload(true)));

    
    const urlParams = new URLSearchParams(window.location.search);
    let gameId = urlParams.get('id');
    while (!gameId) {
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


function updateGame(grid) {
    const game = document.getElementById('game');
    game.innerHTML = "";
    console.log('Grid:', grid);
    for (const row of grid) {
        let all = '';
        for (const item of row) {
            all += `<div class="item ${item.replace(/[^a-zA-Z0-9]/g, '')}"></div>`;
        }
        game.innerHTML += `<div class="row">${all}</div>`;
    }
}

