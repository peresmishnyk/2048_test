import { playFanfare } from './audio.js';
import { initGrid } from './grid.js'; // Assumes initGrid will be moved to grid.js

// DOM Elements (Can be passed in or selected here)
const scoreElement = document.getElementById('score');
const gameBoard = document.getElementById('game-board');
const startOverlay = document.getElementById('start-overlay');
const startButton = document.getElementById('start-button');
const gameContainer = document.querySelector('.game-container');

export function updateScoreDisplay(newScore) {
    if (scoreElement) {
        scoreElement.textContent = newScore;
    }
}

export function showGameOver() {
    console.log("Game Over!");
    if (!gameBoard) return;

    const gameOverDiv = document.createElement('div');
    gameOverDiv.id = 'game-over-message';
    // Apply styles (same as before)
    gameOverDiv.style.position = 'absolute';
    gameOverDiv.style.top = '0';
    gameOverDiv.style.left = '0';
    gameOverDiv.style.width = '100%';
    gameOverDiv.style.height = '100%';
    gameOverDiv.style.backgroundColor = 'rgba(238, 228, 218, 0.73)';
    gameOverDiv.style.display = 'flex';
    gameOverDiv.style.flexDirection = 'column';
    gameOverDiv.style.justifyContent = 'center';
    gameOverDiv.style.alignItems = 'center';
    gameOverDiv.style.zIndex = '100';

    const message = document.createElement('p');
    message.textContent = 'Game Over!';
    message.style.fontSize = '40px';
    message.style.fontWeight = 'bold';
    message.style.color = '#776e65';
    message.style.margin = '0 0 20px 0';

    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart Game';
    // Apply styles (same as before)
    restartButton.style.padding = '10px 20px';
    restartButton.style.fontSize = '18px';
    restartButton.style.backgroundColor = '#8f7a66';
    restartButton.style.color = '#f9f6f2';
    restartButton.style.border = 'none';
    restartButton.style.borderRadius = '3px';
    restartButton.style.cursor = 'pointer';
    restartButton.onclick = () => {
        playFanfare(); // Play fanfare on restart
        // We need a way to signal the main game logic to restart
        // Maybe emit a custom event, or call a function passed in?
        // For now, directly call initGrid (requires importing it)
        initGrid(); // Restart the game
    };

    gameOverDiv.appendChild(message);
    gameOverDiv.appendChild(restartButton);
    gameBoard.appendChild(gameOverDiv);
}

export function hideGameOver() {
    const gameOverMsg = document.getElementById('game-over-message');
    if (gameOverMsg) gameOverMsg.remove();
}

export function hideStartOverlay() {
    if (startOverlay) startOverlay.style.display = 'none';
}

export function showGameContainer() {
    if (gameContainer) gameContainer.style.visibility = 'visible';
}

export function setupStartButtonListener(startCallback) {
     if (startButton) {
        startButton.addEventListener('click', startCallback);
    } else {
        console.error("Start button not found!");
        // Handle fallback if necessary
    }
} 