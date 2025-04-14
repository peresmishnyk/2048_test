import * as state from './state.js';

// Get reference to game board (needed for appendChild)
const gameBoard = document.getElementById('game-board');

// Applies dynamic styles to a single tile
export function applySingleTileStyle(tileElement, value) {
    // ... (copy the existing applySingleTileStyle implementation here) ...
    const tileColors = { /* Replicate colors */
         2: { background: '#eee4da', color: '#776e65' }, 4: { background: '#ede0c8', color: '#776e65' }, 8: { background: '#f2b179', color: '#f9f6f2' }, 16: { background: '#f59563', color: '#f9f6f2' }, 32: { background: '#f67c5f', color: '#f9f6f2' }, 64: { background: '#f65e3b', color: '#f9f6f2' }, 128: { background: '#edcf72', color: '#f9f6f2' }, 256: { background: '#edcc61', color: '#f9f6f2' }, 512: { background: '#edc850', color: '#f9f6f2' }, 1024: { background: '#edc53f', color: '#f9f6f2' }, 2048: { background: '#edc22e', color: '#f9f6f2' },
    };
    const styles = tileColors[value] || { background: '#3c3a32', color: '#f9f6f2' };
    tileElement.style.backgroundColor = styles.background;
    tileElement.style.color = styles.color;

    if (value >= 1024) { tileElement.style.fontSize = '40px'; }
    else if (value >= 128) { tileElement.style.fontSize = '45px'; }
    else { tileElement.style.fontSize = '55px'; }
}

// Creates a tile DOM element, places it, and stores reference in the state.tiles array.
// Returns the created DOM element.
export function createTile(r, c, value, tileSize, gap, boardPadding) {
    // ... (copy the existing createTile implementation here, using state.tiles) ...
    console.log(`[createTile] Called for [${r},${c}], value ${value}`);
    let tile = null;
    try {
        tile = document.createElement('div');
        if (!tile) {
            console.error("[createTile] document.createElement('div') failed!");
            return null;
        }
        console.log(`[createTile] Element created for [${r},${c}]`);

        tile.classList.add('tile');
        tile.classList.add(`tile-${value}`);
        tile.textContent = value;

        console.log(`[createTile] Applying single style for [${r},${c}]`);
        applySingleTileStyle(tile, value);
        console.log(`[createTile] Style applied for [${r},${c}]`);

        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;
        tile.style.top = `${r * (tileSize + gap) + boardPadding}px`;
        tile.style.left = `${c * (tileSize + gap) + boardPadding}px`;
        console.log(`[createTile] Position styles set for [${r},${c}]`);

        if (!gameBoard) {
             console.error("[createTile] gameBoard element not found!");
             return null;
        }
        gameBoard.appendChild(tile);
        console.log(`[createTile] Appended to gameBoard for [${r},${c}]`);

        console.log(`[createTile] Returning tile element for [${r},${c}]`, tile);
        return tile;

    } catch (error) {
        console.error(`[createTile] Error during execution for [${r},${c}]:`, error);
        console.error(`[createTile] State: r=${r}, c=${c}, value=${value}, tileElement=`, tile);
        return null;
    }
}

// Applies base tile styles defined in CSS dynamically (Optional, could be CSS only)
export function applyBaseTileStyles() {
    // ... (copy the existing applyTileStyles implementation here if needed) ...
    // This function seems less necessary if colors/fonts are handled by
    // applySingleTileStyle and initial CSS rules.
    // If keeping it, it should only insert rules not already present.
    console.warn("applyBaseTileStyles might be redundant now.");
} 