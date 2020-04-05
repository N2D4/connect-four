import socketio from 'socket.io-client';
import "regenerator-runtime/runtime.js";
import Game from './game.js';


const urlParams = new URLSearchParams(window.location.search);
const socket = socketio();
let localGame;

setTimeout(async () => {
    socket.on('alert', (...args) => alrt(...args));
    socket.on('reload', () => location.reload(true));
    socket.on('update', updateGame);
    socket.on('disconnect', () => (alrt('You disconnected!'), location.reload(true)));
    socket.on('game-result', (color, result) => gameResult(color, result));
    socket.on('chat', (by, msg) => {
        chatMsg(`${cap(by)}> ${msg}`);
    });

    
    let gameId = urlParams.get('id');
    if (gameId) {
        socket.emit('ljoin', String(gameId), 5, 6, 2);
        document.getElementById('chatarea').classList.remove('hidden');
        document.getElementById('chat').addEventListener('keypress', (e) => {
            if (e.key === "Enter") {
                const chat = document.getElementById('chat');
                if (chat.value !== '') {
                    socket.emit('chat', chat.value);
                    chat.value = '';
                }
            }
        });
    } else {
        resetLocalGame();
    }

}, 500);


async function wait(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

function resetLocalGame() {
    localGame = Game.newGame(
        urlParams.get('width') || 7,
        urlParams.get('height') || 6,
        (urlParams.get('colors') || 'red,yellow').split(','),
        urlParams.get('toWin') || 4,
    );
    updateGame(localGame);
}

async function gameResult(color, res) {
    await wait(50);
    switch (res) {
        case 'win': {
            alrt(`${cap(color)} wins the game!`);
            break;
        }
        case 'draw': {
            alrt(`The game has ended in a draw!`);
            break;
        }
    }
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
            if (localGame) {
                const color = Game.nextColor(localGame);
                const res = Game.play(localGame, i);
                updateGame(localGame);
                if (['win', 'draw'].includes(res)) {
                    gameResult(color, res);
                    const rem = () => {
                        resetLocalGame();
                        document.body.removeEventListener('click', rem);
                    };
                    document.body.addEventListener('click', rem);
                }
            } else {
                socket.emit('play', i);
            }
        });
        game.appendChild(rowel);
    }
}

function cap(str) {
    return str[0].toUpperCase() + str.substr(1);
}

function alrt(str) {
    chatMsg(str);
    alert(str);
}

function chatMsg(msg, color='') {
    const m = document.createElement('div');
    m.innerText = msg;
    m.classList.add('message');
    if (color) m.style.color = color;
    setTimeout(() => {
        m.style.opacity = "0";
    }, 10000);
    document.getElementById('chat').insertAdjacentElement('beforebegin', m);
}

