import { initGrid } from './grid.js';
import { handleInput, executeHelpMove } from './game.js';
import { setupStartButtonListener, showGameContainer, hideStartOverlay } from './ui.js';
import * as audio from './audio.js';
// import { applyBaseTileStyles } from './tile.js'; // Likely not needed

// Main game start function - This function orchestrates the game start
function startGame() {
    console.log("Start button clicked.");
    // 1. Initialize Audio Context (requires user interaction, provided by button click)
    audio.initAudioContext();

    // 2. Update UI - Hide overlay, show game area
    hideStartOverlay();
    showGameContainer();

    // 3. Initialize the game board state and render it
    initGrid(); // From grid.js

    // 4. Add game-specific event listeners now that the game has started
    document.addEventListener('keydown', handleInput); // From game.js

    // Setup AutoMove button listener
    const helpButton = document.getElementById('help-button');
    if (helpButton) {
        helpButton.addEventListener('click', executeHelpMove); // From game.js
    } else {
        console.warn("AutoMove button not found after start.");
    }
    // Note: Test game over button logic was removed previously

    console.log('Game initialized and started.');
}

// Initial setup on DOM load
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded.");

    // Basic anti-proxy / environment check - REVERSED LOGIC
    const hostname = window.location.hostname.toLowerCase();
    if (!hostname.includes('test')) { // Check if hostname DOES NOT contain 'test'
        console.error("Incorrect environment detected (hostname missing 'test'). Game initialization blocked.");
        // Optionally display a message to the user
        const overlay = document.getElementById('start-overlay');
        const button = document.getElementById('start-button');
        if (overlay) {
            overlay.innerHTML = '<p style="color: red; text-align: center;">Cannot run in this environment.</p>'; // Keep generic message or change
            overlay.style.display = 'flex'; // Ensure overlay is visible
            if (button) button.remove(); // Remove the start button
        }
        return; // Stop further setup
    }

    // If check passes (hostname includes 'test'), proceed with setup
    console.log("Correct environment detected. Setting up start button.");
    // applyBaseTileStyles(); // Call if needed for dynamic base styles
    setupStartButtonListener(startGame); // From ui.js
});

// No other functions should be defined in main.js - they belong in modules. 