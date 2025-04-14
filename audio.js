import * as state from './state.js';

// Get audio elements (assuming they are always present in HTML)
const backgroundAudio = document.getElementById('background-audio');
const moveAudio = document.getElementById('move-audio');
const fanfareAudio = document.getElementById('fanfare-audio');

// Function to initialize audio context on first user interaction
export function initAudioContext() {
    if (state.audioInitialized) return;
    console.log("Initializing audio context...");
    state.setAudioInitialized(true);

    playFanfare(); // Try fanfare first
    if(moveAudio) { // Attempt to unlock with move sound as fallback
        moveAudio.play().then(()=>moveAudio.pause()).catch(()=>{/* ignore */});
    }
    startBackgroundMusic(); // Try background music
}

// Function to start background music
export function startBackgroundMusic() {
    if (backgroundAudio) {
        console.log("Attempting to start background music...");
        backgroundAudio.volume = 0.3;
        backgroundAudio.play().then(() => {
            console.log("Background music started.");
        }).catch(error => {
            console.warn("Background music playback failed:", error);
        });
    } else {
         console.warn("Background audio element not found.");
    }
}

// Function to play the move sound
export function playMoveSound() {
    if (!state.audioInitialized) return;
    if (moveAudio) {
        moveAudio.pause();
        moveAudio.currentTime = 0;
        moveAudio.play().catch(error => {
            console.warn("Move sound playback failed:", error);
        });
    } else {
        console.warn("Move audio element not found.")
    }
}

// Function to play fanfare
export function playFanfare() {
     if (state.audioInitialized && fanfareAudio) {
         console.log("Attempting to play fanfare...");
         fanfareAudio.pause();
         fanfareAudio.currentTime = 0;
         fanfareAudio.play().catch(error => {
             console.warn("Fanfare playback failed:", error);
         });
     } else if (!state.audioInitialized) {
          console.warn("Cannot play fanfare: Audio context not initialized.");
     } else {
          console.warn("Fanfare audio element not found.");
     }
} 