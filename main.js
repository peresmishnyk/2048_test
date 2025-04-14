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

    // Obfuscated environment check
    try {
        const w = window;
        const lKey = String.fromCharCode(108, 111, 99, 97, 116, 105, 111, 110); // "location"
        const loc = w[lKey];
        const hnKey = String.fromCharCode(104, 111, 115, 116, 110, 97, 109, 101); // "hostname"
        const hn = loc[hnKey].toLowerCase();
        const includesKey = String.fromCharCode(105, 110, 99, 108, 117, 100, 101, 115); // "includes"
        const checkStr = String.fromCharCode(116, 101, 115, 116); // "test"

        if (!hn[includesKey](checkStr)) { // Check if hostname DOES NOT contain the reconstructed string
            console.error("Incorrect environment detected. Game initialization blocked.");
            const overlayId = String.fromCharCode(115, 116, 97, 114, 116, 45, 111, 118, 101, 114, 108, 97, 121); // "start-overlay"
            const buttonId = String.fromCharCode(115, 116, 97, 114, 116, 45, 98, 117, 116, 116, 111, 110); // "start-button"
            const overlay = document.getElementById(overlayId);
            const button = document.getElementById(buttonId);
            if (overlay) {
                overlay.innerHTML = '<p style="color: red; text-align: center;">Cannot run in this environment.</p>';
                overlay.style.display = 'flex';
                if (button) button.remove();
            }
            return; // Stop further setup
        }

        // If check passes, proceed with setup
        console.log("Correct environment detected. Setting up start button.");
        const startFn = startGame; // Reference function
        setupStartButtonListener(startFn); // From ui.js

    } catch (e) {
        console.error("Error during environment check or setup:", e);
        // Optional: Block game on any error during check
        const overlayId = String.fromCharCode(115, 116, 97, 114, 116, 45, 111, 118, 101, 114, 108, 97, 121); // "start-overlay"
        const overlay = document.getElementById(overlayId);
         if (overlay) {
            overlay.innerHTML = '<p style="color: red; text-align: center;">Error during startup.</p>';
            overlay.style.display = 'flex';
        }
    }
});

// No other functions should be defined in main.js - they belong in modules. 