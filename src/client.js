import socketio from 'socket.io-client';
import "regenerator-runtime/runtime.js";
import Game from './game.js';


const socket = socketio();

setTimeout(async () => {
    socket.on('alert', (...args) => alert(...args));
    socket.on('alert-soon', (...args) => setTimeout(() => alert(...args), 50));
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


function updateGame(gameState) {
    const game = document.getElementById('game');
    game.innerHTML = "";
    console.log('Game state:', gameState);
    for (let i = 0; i < gameState.grid.length; i++) {
        const row = gameState.grid[i];
        let all = '';
        for (const item of row) {
            all += `<div class="item ${item.replace(/[^a-zA-Z0-9]/g, '')}"></div>`;
        }
        const rowel = document.createElement('div');
        rowel.innerHTML = all;
        rowel.classList.add('row');
        rowel.addEventListener('click', () => {
            console.log(`Played a move! ${i}`);
            socket.emit('play', i)
        });
        game.appendChild(rowel);
    }
}

