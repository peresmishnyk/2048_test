import { gridSize } from './constants.js';

export let grid = []; // Represents the game state
export let tiles = []; // Represents the DOM elements for the tiles
export let score = 0;
export let isGameOver = false;
export let isAnimating = false;
export let audioInitialized = false;

// Function to reset state (used by initGrid)
export function resetState() {
    grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    tiles = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    score = 0;
    isGameOver = false;
    isAnimating = false;
    // audioInitialized is generally not reset on game restart
}

// Functions to update state (avoids direct import modification)
export function setGrid(newGrid) {
    grid = newGrid;
}

export function setTiles(newTiles) {
    tiles = newTiles;
}

export function setScore(newScore) {
    score = newScore;
}

export function incrementScore(amount) {
    score += amount;
}

export function setIsGameOver(value) {
    isGameOver = value;
}

export function setIsAnimating(value) {
    isAnimating = value;
}

export function setAudioInitialized(value) {
    audioInitialized = value;
}

export function setGridValue(r, c, value) {
    if (grid && grid[r]) {
        grid[r][c] = value;
    } else {
        console.error(`Attempted to set grid value at invalid coordinates: [${r}, ${c}]`);
    }
} 