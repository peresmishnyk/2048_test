import { gridSize } from './constants.js';
import * as state from './state.js';
import * as audio from './audio.js';
import * as ui from './ui.js';
import { addRandomTile, transposeGrid, renderGrid } from './grid.js';
import { createTile, applySingleTileStyle } from './tile.js';

// Get reference to game board
const gameBoard = document.getElementById('game-board');

// --- Game Over Logic ---
function hasEmptyCells() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (state.grid[r][c] === 0) return true;
        }
    }
    return false;
}

function canMove() {
    // Check horizontal merges
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize - 1; c++) {
            if (state.grid[r][c] !== 0 && state.grid[r][c] === state.grid[r][c + 1]) return true;
        }
    }
    // Check vertical merges
    for (let c = 0; c < gridSize; c++) {
        for (let r = 0; r < gridSize - 1; r++) {
            if (state.grid[r][c] !== 0 && state.grid[r][c] === state.grid[r + 1][c]) return true;
        }
    }
    // Check for empty cells
    if (hasEmptyCells()) return true;

    return false; // No moves possible
}

function checkGameOver() {
     if (!canMove()) { // Removed hasEmptyCells check as canMove includes it indirectly
        state.setIsGameOver(true);
        ui.showGameOver();
     }
}

// --- Move Calculation & Processing ---

function processRowDetailed(row) {
    // ... (copy the existing processRowDetailed implementation here) ...
    const actions = [];
    const size = row.length;
    let nextId = 0;
    let tempRow = row.map((value, index) => (value ? { value, index, id: nextId++ } : null));
    let mergeScore = 0;

    // 1. Slide left
    let currentWriteIndex = 0;
    for (let i = 0; i < size; i++) {
        if (tempRow[i]) {
            if (i !== currentWriteIndex) {
                actions.push({ type: 'move', from: tempRow[i].index, to: currentWriteIndex, value: tempRow[i].value, id: tempRow[i].id });
                tempRow[currentWriteIndex] = tempRow[i];
                tempRow[i] = null;
            }
            currentWriteIndex++;
        }
    }
    // 2. Merge
    for (let i = 0; i < size - 1; i++) {
        if (tempRow[i] && tempRow[i+1] && tempRow[i].value === tempRow[i+1].value) {
            const mergedValue = tempRow[i].value * 2;
            mergeScore += mergedValue;
            actions.push({ type: 'merge', from1: tempRow[i].index, from2: tempRow[i+1].index, to: i, value: mergedValue, id1: tempRow[i].id, id2: tempRow[i+1].id });
            tempRow[i].value = mergedValue;
            tempRow[i+1] = null;
            // 3. Slide again after merge
            for (let j = i + 2; j < size; j++) {
                 if (tempRow[j]) {
                    const newTargetIndex = j - 1;
                    let existingMoveIndex = actions.findIndex(a => a.type === 'move' && a.id === tempRow[j].id);
                    if (existingMoveIndex !== -1) {
                         actions[existingMoveIndex].to = newTargetIndex;
                    } else {
                         // Assuming move action always added during initial slide if needed
                         // This push might be redundant or cause issues if logic isn't perfect
                         actions.push({ type: 'move', from: tempRow[j].index, to: newTargetIndex, value: tempRow[j].value, id: tempRow[j].id });
                    }
                    tempRow[newTargetIndex] = tempRow[j];
                    tempRow[j] = null;
                 }
            }
        }
    }
    // Final state and filtering actions
    const finalRow = Array(size).fill(0);
    tempRow.forEach((tile, index) => { if(tile) finalRow[index] = tile.value; });

    const filteredActionsPass1 = actions.filter(action => !(action.type === 'move' && actions.some(m => m.type === 'merge' && m.id2 === action.id)));
    const finalActions = filteredActionsPass1.filter(action => !(action.type === 'move' && filteredActionsPass1.some(m => m.type === 'merge' && m.id1 === action.id)));

    return { actions: finalActions, finalRow, mergeScore };
}

function calculateMoveLeft(currentGrid) {
    // ... (copy implementation, use state.grid, call processRowDetailed) ...
    console.log("Calculating move left...");
    let moved = false;
    let scoreIncrease = 0;
    const actions = [];
    const finalGrid = [];
    for (let r = 0; r < gridSize; r++) {
        const originalRow = currentGrid[r];
        const result = processRowDetailed(originalRow);
        finalGrid.push(result.finalRow);
        scoreIncrease += result.mergeScore;
        result.actions.forEach(action => {
            actions.push({ ...action, row: r });
            moved = true;
        });
        if (!moved && originalRow.join(',') !== result.finalRow.join(',')) { moved = true; }
    }
    return { moved, finalGrid, actions, scoreIncrease };
}

function calculateMoveRight(currentGrid) {
     // ... (copy implementation, use state.grid, call processRowDetailed, translate) ...
    console.log("Calculating move right...");
    let moved = false;
    let scoreIncrease = 0;
    const actions = [];
    const finalGrid = [];
    for (let r = 0; r < gridSize; r++) {
        const originalRow = currentGrid[r];
        const reversedRow = [...originalRow].reverse();
        const result = processRowDetailed(reversedRow);
        finalGrid.push(result.finalRow.reverse());
        scoreIncrease += result.mergeScore;
        result.actions.forEach(action => {
            moved = true;
            const translatedAction = { ...action, row: r, from: gridSize - 1 - action.from, to: gridSize - 1 - action.to, ...(action.type === 'merge' && { from1: gridSize - 1 - action.from1, from2: gridSize - 1 - action.from2 }) };
            actions.push(translatedAction);
        });
        if (!moved && originalRow.join(',') !== finalGrid[r].join(',')) { moved = true; }
    }
    return { moved, finalGrid, actions, scoreIncrease };
}

function calculateMoveUp(currentGrid) {
    // ... (copy implementation, use state.grid, transposeGrid, processRowDetailed, translate) ...
    console.log("Calculating move up...");
    if (!currentGrid || currentGrid.length !== gridSize || currentGrid.some(row => !row || row.length !== gridSize)) {
        console.error("calculateMoveUp invalid grid:", currentGrid);
        return { moved: false, finalGrid: currentGrid, actions: [], scoreIncrease: 0 };
    }
    let moved = false;
    let scoreIncrease = 0;
    const actions = [];
    let transposedGrid = transposeGrid(currentGrid);
    const finalTransposedGrid = [];
    for (let c = 0; c < gridSize; c++) {
        if (!transposedGrid || !transposedGrid[c]) {
             console.error(`calculateMoveUp error: Transposed grid missing column ${c}`);
             finalTransposedGrid.push(Array(gridSize).fill(0));
             continue;
        }
        const originalCol = transposedGrid[c];
        const result = processRowDetailed(originalCol);
        finalTransposedGrid.push(result.finalRow);
        scoreIncrease += result.mergeScore;
        result.actions.forEach(action => {
            moved = true;
            const translatedAction = { ...action, row: action.from, col: c, targetRow: action.to, ...(action.type === 'merge' && { from1Row: action.from1, from2Row: action.from2 }) };
            actions.push(translatedAction);
        });
        if (!moved && originalCol.join(',') !== result.finalRow.join(',')) { moved = true; }
    }
    const finalGrid = transposeGrid(finalTransposedGrid);
    if (!finalGrid || finalGrid.length !== gridSize || finalGrid.some(row => !row || row.length !== gridSize)) {
        console.error("calculateMoveUp invalid finalGrid after transpose");
        return { moved: false, finalGrid: currentGrid, actions: [], scoreIncrease: 0 };
    }
    return { moved, finalGrid, actions, scoreIncrease };
}

function calculateMoveDown(currentGrid) {
    // ... (copy implementation, use state.grid, transposeGrid, processRowDetailed, translate) ...
    console.log("Calculating move down...");
    if (!currentGrid || currentGrid.length !== gridSize || currentGrid.some(row => !row || row.length !== gridSize)) {
        console.error("calculateMoveDown invalid grid:", currentGrid);
        return { moved: false, finalGrid: currentGrid, actions: [], scoreIncrease: 0 };
    }
    let moved = false;
    let scoreIncrease = 0;
    const actions = [];
    let transposedGrid = transposeGrid(currentGrid);
    const finalTransposedGrid = [];
    for (let c = 0; c < gridSize; c++) {
         if (!transposedGrid || !transposedGrid[c]) {
             console.error(`calculateMoveDown error: Transposed grid missing column ${c}`);
             finalTransposedGrid.push(Array(gridSize).fill(0));
             continue;
        }
        const originalCol = transposedGrid[c];
        const reversedCol = [...originalCol].reverse();
        const result = processRowDetailed(reversedCol);
        finalTransposedGrid.push(result.finalRow.reverse());
        scoreIncrease += result.mergeScore;
        result.actions.forEach(action => {
            moved = true;
            const fromRow = gridSize - 1 - action.from;
            const toRow = gridSize - 1 - action.to;
            const from1Row = action.type === 'merge' ? gridSize - 1 - action.from1 : undefined;
            const from2Row = action.type === 'merge' ? gridSize - 1 - action.from2 : undefined;
            const translatedAction = { ...action, row: fromRow, col: c, targetRow: toRow, ...(action.type === 'merge' && { from1Row, from2Row }) };
            actions.push(translatedAction);
        });
         if (!moved && originalCol.join(',') !== finalTransposedGrid[c].join(',')) { moved = true; }
    }
    const finalGrid = transposeGrid(finalTransposedGrid);
    if (!finalGrid || finalGrid.length !== gridSize || finalGrid.some(row => !row || row.length !== gridSize)) {
        console.error("calculateMoveDown invalid finalGrid after transpose");
        return { moved: false, finalGrid: currentGrid, actions: [], scoreIncrease: 0 };
    }
    return { moved, finalGrid, actions, scoreIncrease };
}

// --- Animation --- //

async function animateMove(actions, finalGrid, scoreIncrease) {
    if (state.isAnimating) return;
    state.setIsAnimating(true);
    console.log("--- Starting animateMove (Re-enabled) ---", actions);

    // --- Re-enable CSS Animation Steps --- 
    const animationPromises = [];
    const tilesToRemove = []; // Keep track of elements to remove *after* animation
    const tilesToUpdate = new Map(); // Keep track of elements that merged (for potential post-animation update if needed)

    const gap = 10;
    const boardPadding = 10;
    const boardWidth = gameBoard.clientWidth || 400;
    const tileSize = (boardWidth - 2 * boardPadding - (gridSize - 1) * gap) / gridSize;
    // Use the state *before* the move starts for finding elements
    const currentTilesState = state.tiles.map(row => [...row]);

    actions.forEach(action => {
        let sourceRow, sourceCol, targetRow, targetCol, tileElement, targetTop, targetLeft;
        const { row, col } = action;

        if (action.type === 'move') {
            const { from, to, value, id } = action;
            if (col !== undefined) { /* Up/Down */ sourceRow = action.row; sourceCol = col; targetRow = action.targetRow; targetCol = col; }
            else { /* Left/Right */ sourceRow = row; sourceCol = from; targetRow = row; targetCol = to; }
            tileElement = currentTilesState[sourceRow]?.[sourceCol];

             if (tileElement) {
                 console.log(`Animating MOVE: from [${sourceRow},${sourceCol}] to [${targetRow},${targetCol}]`);
                 targetTop = `${targetRow * (tileSize + gap) + boardPadding}px`;
                 targetLeft = `${targetCol * (tileSize + gap) + boardPadding}px`;
                 animationPromises.push(new Promise(resolve => { const h = e => {if(e.target===tileElement && (e.propertyName==='top'||e.propertyName==='left')){tileElement.removeEventListener('transitionend',h);resolve();}}; tileElement.addEventListener('transitionend',h); setTimeout(()=>{ if(tileElement.parentNode) tileElement.removeEventListener('transitionend',h); resolve();}, 270);})); // Added check and adjusted timeout slightly
                 tileElement.style.top = targetTop;
                 tileElement.style.left = targetLeft;
             } else {
                 console.warn(`Move action: Tile DOM element not found at start pos [${sourceRow}, ${sourceCol}]`);
             }

        } else if (action.type === 'merge') {
            const { from1, from2, to, value, from1Row, from2Row, targetRow } = action;
            let s1Row, s1Col, s2Row, s2Col, tCol, tRow;
             if (col !== undefined) { /* Up/Down */ s1Row = from1Row; s1Col = col; s2Row = from2Row; s2Col = col; tCol = col; tRow = targetRow; }
             else { /* Left/Right */ s1Row = row; s1Col = from1; s2Row = row; s2Col = from2; tCol = to; tRow = row; }
            const tile1 = currentTilesState[s1Row]?.[s1Col]; // Stays
            const tile2 = currentTilesState[s2Row]?.[s2Col]; // Moves and disappears
              if (tile1 && tile2) {
                  console.log(`Animating MERGE: [${s2Row},${s2Col}] into [${s1Row},${s1Col}] at [${tRow},${tCol}]`);
                  targetTop = `${tRow * (tileSize + gap) + boardPadding}px`;
                  targetLeft = `${tCol * (tileSize + gap) + boardPadding}px`;
                  tile1.style.zIndex = '10'; tile2.style.zIndex = '5';
                  // Animate both tiles moving to the merge spot
                  animationPromises.push(new Promise(resolve => { const h = e => {if(e.target===tile1 && (e.propertyName==='top'||e.propertyName==='left')){tile1.removeEventListener('transitionend',h);resolve();}}; tile1.addEventListener('transitionend',h); setTimeout(()=>{if(tile1.parentNode) tile1.removeEventListener('transitionend',h); resolve();}, 270);}));
                  animationPromises.push(new Promise(resolve => { const h = e => {if(e.target===tile2 && (e.propertyName==='top'||e.propertyName==='left')){tile2.removeEventListener('transitionend',h);resolve();}}; tile2.addEventListener('transitionend',h); setTimeout(()=>{if(tile2.parentNode) tile2.removeEventListener('transitionend',h); resolve();}, 270);}));
                  tile1.style.top = targetTop; tile1.style.left = targetLeft;
                  tile2.style.top = targetTop; tile2.style.left = targetLeft;
                  // Mark tile2 for removal after animation
                  tilesToRemove.push(tile2);
                  // We don't need tilesToUpdate anymore as renderGrid handles the final state
                  // tilesToUpdate.set(`${tRow},${tCol}`, { element: tile1, newValue: value });
             } else {
                 console.warn(`Merge action: Tile DOM elements not found at [${s1Row},${s1Col}] or [${s2Row},${s2Col}]`);
             }
            // No common move logic needed for merge action
        }
    });

    await Promise.all(animationPromises);
    console.log("--- All CSS transitions awaited ---");

    // --- Post-Animation Updates (Simplified) ---
    console.log("Updating grid state and score...");
    state.setGrid(finalGrid);
    state.incrementScore(scoreIncrease);
    ui.updateScoreDisplay(state.score);

    // Remove the merged tile DOM elements (tile2 from merges)
    console.log("Removing merged tile DOM elements:", tilesToRemove);
    tilesToRemove.forEach(tile => tile.remove());

    // Add the new random tile DATA to the grid state
    addRandomTile(); // Updates state.grid
    console.log("Grid state after adding random tile data:", JSON.parse(JSON.stringify(state.grid)));

    // Re-render the entire board based on the final grid data state
    console.log("Calling full renderGrid() post-animation...");
    renderGrid(); // Clears old tiles, creates new ones based on state.grid, updates state.tiles
    console.log("renderGrid() complete post-animation.");

    // Check for game over after the state is fully updated and rendered
    checkGameOver();

    console.log("--- Animation sequence complete. isAnimating = false. ---");
    state.setIsAnimating(false);
}

// --- Input Handling ---

export function handleInput(event) {
    if (state.isGameOver || state.isAnimating || !state.audioInitialized) return;

    let moveCalculationResult = null;
    switch (event.key) {
        case 'ArrowUp': moveCalculationResult = calculateMoveUp(state.grid); break;
        case 'ArrowDown': moveCalculationResult = calculateMoveDown(state.grid); break;
        case 'ArrowLeft': moveCalculationResult = calculateMoveLeft(state.grid); break;
        case 'ArrowRight': moveCalculationResult = calculateMoveRight(state.grid); break;
        default: return;
    }

    if (moveCalculationResult && moveCalculationResult.moved) {
        audio.playMoveSound();
        animateMove(
            moveCalculationResult.actions,
            moveCalculationResult.finalGrid,
            moveCalculationResult.scoreIncrease
        ).catch(error => {
             console.error("Animation failed:", error);
             state.setIsAnimating(false);
             state.setGrid(moveCalculationResult.finalGrid);
             state.incrementScore(moveCalculationResult.scoreIncrease);
             // Need access to renderGrid for fallback - imported now
             // For now, assume renderGrid is globally accessible or imported
            renderGrid(); // Requires renderGrid to be available here
            ui.updateScoreDisplay(state.score);
             checkGameOver();
        });
    } else {
        checkGameOver(); // Check even if no move made
    }
}

// --- AI Help Logic ---

function simulateMove(direction) {
    // ... (Needs refactoring to use calculateMove* functions) ...
    console.warn("simulateMove needs refactoring for modular structure");
    const calcFn = direction === 'left' ? calculateMoveLeft :
                   direction === 'right' ? calculateMoveRight :
                   direction === 'up' ? calculateMoveUp :
                   direction === 'down' ? calculateMoveDown : null;
    if (!calcFn) return { moved: false, score: 0, emptyCells: 0 };

    const result = calcFn(state.grid);
    let emptyCells = 0;
    if (result.moved) {
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (result.finalGrid[r][c] === 0) emptyCells++;
            }
        }
    }
    return { moved: result.moved, score: result.scoreIncrease, emptyCells };
}

function getBestMove() {
     // ... (Uses simulateMove, logic remains similar) ...
     const moves = ['up', 'down', 'left', 'right'];
     let bestMove = null; let bestScore = -1; let maxEmptyCells = -1;
     moves.forEach(direction => {
         const result = simulateMove(direction);
         if (result.moved) {
             if (result.score > bestScore) { bestScore = result.score; maxEmptyCells = result.emptyCells; bestMove = direction; }
             else if (result.score === bestScore && result.emptyCells > maxEmptyCells) { maxEmptyCells = result.emptyCells; bestMove = direction; }
         }
     });
     console.log("Best move:", bestMove, "Score:", bestScore, "Empty:", maxEmptyCells);
     return bestMove;
}

export function executeHelpMove() {
    if (state.isGameOver || state.isAnimating || !state.audioInitialized) return;
    const bestMoveDirection = getBestMove();
    if (bestMoveDirection) {
        let moveCalculationResult = null;
        switch (bestMoveDirection) {
            case 'up': moveCalculationResult = calculateMoveUp(state.grid); break;
            case 'down': moveCalculationResult = calculateMoveDown(state.grid); break;
            case 'left': moveCalculationResult = calculateMoveLeft(state.grid); break;
            case 'right': moveCalculationResult = calculateMoveRight(state.grid); break;
        }
        if (moveCalculationResult && moveCalculationResult.moved) {
             audio.playMoveSound();
             animateMove(
                 moveCalculationResult.actions,
                 moveCalculationResult.finalGrid,
                 moveCalculationResult.scoreIncrease
             ).catch(error => { /* ... error handling ... */ });
        } else { console.warn("Help suggested move resulted in no change?"); }
    } else { console.log("Help: No beneficial moves found."); }
} 