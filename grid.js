import { gridSize } from './constants.js';
import * as state from './state.js';
import { createTile } from './tile.js';
import { hideGameOver, updateScoreDisplay } from './ui.js';

// Get reference to game board
const gameBoard = document.getElementById('game-board');

// Renders the entire grid based on the 'grid' state array.
export function renderGrid() {
    if (!gameBoard) {
        console.error("[renderGrid] gameBoard element not found!");
        return;
    }
    // Clear existing tile elements from the board
    gameBoard.querySelectorAll('.tile').forEach(tile => tile.remove());
    // Reset the DOM references in the state
    state.setTiles(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
    // Get the newly reset tiles array to modify it locally
    const newTilesState = state.tiles;

    const gap = 10;
    const boardPadding = 10;
    const boardWidth = gameBoard.clientWidth || 400;
    const tileSize = (boardWidth - 2 * boardPadding - (gridSize - 1) * gap) / gridSize;

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (state.grid[r][c] !== 0) {
                // createTile now ONLY returns the element
                const tileElement = createTile(r, c, state.grid[r][c], tileSize, gap, boardPadding);
                // Assign the created element to our local copy of the state
                if (tileElement && newTilesState[r]) {
                     newTilesState[r][c] = tileElement;
                }
            }
        }
    }
    // No need to call setTiles again as we modified the array obtained from the state module
    console.log("Full render complete.");
}

// Adds a random tile (2 or 4) to an empty cell in the grid state.
export function addRandomTile() {
    if (state.isGameOver) return;
    let emptyCells = [];
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (state.grid[r][c] === 0) {
                emptyCells.push({ r, c });
            }
        }
    }

    if (emptyCells.length > 0) {
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newValue = Math.random() < 0.9 ? 2 : 4;
        // Use the setter function instead of direct modification
        // state.grid[r][c] = newValue;
        state.setGridValue(r, c, newValue);
        console.log(`[addRandomTile] Added ${newValue} at [${r},${c}] using setGridValue`);
    } else {
        // Cannot add tile - potentially game over if no moves possible
        console.log("[addRandomTile] No empty cells found.");
        // Game over check happens after move attempt in game.js
    }
}

// Initializes the grid state and renders the initial board.
export function initGrid() {
    state.resetState(); // Reset grid, tiles, score, flags
    updateScoreDisplay(state.score);
    hideGameOver();

    if (!gameBoard) {
        console.error("[initGrid] gameBoard element not found!");
        return;
    }

    // Clear existing background grid cells
    gameBoard.querySelectorAll('.grid-cell').forEach(cell => cell.remove());

    // Create the background grid cells
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        gameBoard.appendChild(cell);
    }

    // Add initial tiles (updates grid state)
    addRandomTile();
    addRandomTile();

    // Initial render (creates DOM elements based on grid state)
    renderGrid();
}

// Helper function to transpose the grid (used by move logic)
export function transposeGrid(matrix) {
    // ... (copy the existing transposeGrid implementation here with checks) ...
    if (!matrix || matrix.length === 0 || !matrix[0] || matrix.some(row => !row || row.length !== matrix[0].length)) {
        console.error("transposeGrid called with invalid matrix:", JSON.parse(JSON.stringify(matrix)));
        return Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    }
    try {
        return matrix[0].map((col, i) => matrix.map(row => row[i]));
    } catch (e) {
        console.error("Error during transposeGrid execution:", e, "Input matrix:", JSON.parse(JSON.stringify(matrix)));
        return Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    }
} 