const gameBoard = document.getElementById('game-board');
const backgroundAudio = document.getElementById('background-audio');
const moveAudio = document.getElementById('move-audio');
const startOverlay = document.getElementById('start-overlay');
const startButton = document.getElementById('start-button');
const gameContainer = document.querySelector('.game-container'); // Get the game container
const fanfareAudio = document.getElementById('fanfare-audio');
let audioInitialized = false; // Flag to track if user interaction has occurred for audio

const gridSize = 4;
let grid = []; // Represents the game state
let tiles = []; // Represents the DOM elements for the tiles
let score = 0;
let isGameOver = false;
let isAnimating = false; // Flag to prevent input during animation

function initGrid() {
    score = 0;
    isGameOver = false;
    isAnimating = false; // Reset animation flag
    updateScoreDisplay();
    // Clear any game over message
    const gameOverMsg = document.getElementById('game-over-message');
    if (gameOverMsg) gameOverMsg.remove();

    // Clear existing background grid cells before creating new ones
    const existingCells = gameBoard.querySelectorAll('.grid-cell');
    existingCells.forEach(cell => cell.remove());

    // Clear existing tile elements as well
    const existingTiles = gameBoard.querySelectorAll('.tile');
    existingTiles.forEach(tile => tile.remove());

    // Create the background grid cells
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        gameBoard.appendChild(cell);
    }

    // Initialize the game state grid with zeros
    grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    tiles = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));

    // Add initial tiles
    addRandomTile();
    addRandomTile();
    // Initial render
    renderGrid();
}

function addRandomTile() {
    if (isGameOver) return;
    let emptyCells = [];
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] === 0) {
                emptyCells.push({ r, c });
            }
        }
    }

    if (emptyCells.length > 0) {
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        // 90% chance of 2, 10% chance of 4
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    } else {
        // Check for game over only if no empty cells are left
        if (!canMove()) {
            gameOver();
        }
    }
}

function renderGrid() {
    // Calculate tile size based on current board width
    const gap = 10;
    const boardPadding = 10;
    // Ensure clientWidth is available, otherwise use a default or wait
    const boardWidth = gameBoard.clientWidth || 400; // Use 400 as fallback
    const tileSize = (boardWidth - 2 * boardPadding - (gridSize - 1) * gap) / gridSize;

    // Clear existing tiles before re-rendering
    const existingTiles = gameBoard.querySelectorAll('.tile');
    existingTiles.forEach(tile => tile.remove());

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] !== 0) {
                createTile(r, c, grid[r][c], tileSize, gap, boardPadding);
            }
        }
    }
}

function createTile(r, c, value, tileSize, gap, boardPadding) {
    console.log(`[createTile] Called for [${r},${c}], value ${value}`);
    let tile = null; // Initialize to null
    try {
        tile = document.createElement('div');
        if (!tile) {
            console.error("[createTile] document.createElement('div') failed!");
            return null; // Explicitly return null if creation fails
        }
        console.log(`[createTile] Element created for [${r},${c}]`);

        tile.classList.add('tile');
        tile.classList.add(`tile-${value}`);
        tile.textContent = value;

        console.log(`[createTile] Applying single style for [${r},${c}]`);
        applySingleTileStyle(tile, value); // Apply colors/font size
        console.log(`[createTile] Style applied for [${r},${c}]`);

        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;
        tile.style.top = `${r * (tileSize + gap) + boardPadding}px`;
        tile.style.left = `${c * (tileSize + gap) + boardPadding}px`;
        console.log(`[createTile] Position styles set for [${r},${c}]`);

        // Append only if gameBoard exists
        if (!gameBoard) {
             console.error("[createTile] gameBoard element not found!");
             return null; // Cannot append
        }
        gameBoard.appendChild(tile);
        console.log(`[createTile] Appended to gameBoard for [${r},${c}]`);

        // *** Store the DOM element reference in the global tiles array ***
        console.log(`[createTile] Checking tiles[${r}] before assignment for [${r},${c}]`);
        // Check if the global tiles array and the specific row exist
        if (tiles && Array.isArray(tiles[r])) {
            console.log(`[createTile] Assigning tile element to tiles[${r}][${c}]`);
            tiles[r][c] = tile;
            console.log(`[createTile] Assignment done for [${r},${c}]`);
        } else {
            console.error(`[createTile] tiles array or row tiles[${r}] is invalid. Cannot assign DOM reference. tiles:`, JSON.stringify(tiles));
            // We should still return the tile element even if we couldn't store the reference
        }

        console.log(`[createTile] Returning tile element for [${r},${c}]`, tile);
        return tile; // Return the created element

    } catch (error) {
        console.error(`[createTile] Error during execution for [${r},${c}]:`, error);
        // Log the state just before the error if possible
        console.error(`[createTile] State when error occurred: r=${r}, c=${c}, value=${value}, tileElement (partially created?)=`, tile);
        return null; // Explicitly return null on error
    }
}

// Add tile color styles dynamically
function applyTileStyles() {
    const styleSheet = document.styleSheets[0];
    const tileColors = {
        2: { background: '#eee4da', color: '#776e65' },
        4: { background: '#ede0c8', color: '#776e65' },
        8: { background: '#f2b179', color: '#f9f6f2' },
        16: { background: '#f59563', color: '#f9f6f2' },
        32: { background: '#f67c5f', color: '#f9f6f2' },
        64: { background: '#f65e3b', color: '#f9f6f2' },
        128: { background: '#edcf72', color: '#f9f6f2' },
        256: { background: '#edcc61', color: '#f9f6f2' },
        512: { background: '#edc850', color: '#f9f6f2' },
        1024: { background: '#edc53f', color: '#f9f6f2' },
        2048: { background: '#edc22e', color: '#f9f6f2' },
        // Add more if needed
    };

    for (const [value, styles] of Object.entries(tileColors)) {
        const selector = `.tile-${value}`;
        const rule = `background-color: ${styles.background}; color: ${styles.color};`;
        styleSheet.insertRule(`${selector} { ${rule} }`, styleSheet.cssRules.length);

        // Adjust font size for larger numbers (relative to the new base size)
        if (value >= 1024) {
            styleSheet.insertRule(`${selector} { font-size: 40px; }`, styleSheet.cssRules.length);
        } else if (value >= 128) {
            styleSheet.insertRule(`${selector} { font-size: 45px; }`, styleSheet.cssRules.length);
        }
        // Add more font size adjustments if needed
    }
}

// Helper to apply dynamic styles to a single tile (used after merge/create)
function applySingleTileStyle(tileElement, value) {
    const tileColors = {
        2: { background: '#eee4da', color: '#776e65' },
        4: { background: '#ede0c8', color: '#776e65' },
        8: { background: '#f2b179', color: '#f9f6f2' },
        16: { background: '#f59563', color: '#f9f6f2' },
        32: { background: '#f67c5f', color: '#f9f6f2' },
        64: { background: '#f65e3b', color: '#f9f6f2' },
        128: { background: '#edcf72', color: '#f9f6f2' },
        256: { background: '#edcc61', color: '#f9f6f2' },
        512: { background: '#edc850', color: '#f9f6f2' },
        1024: { background: '#edc53f', color: '#f9f6f2' },
        2048: { background: '#edc22e', color: '#f9f6f2' },
    };
    const styles = tileColors[value] || { background: '#3c3a32', color: '#f9f6f2' }; // Default for > 2048
    tileElement.style.backgroundColor = styles.background;
    tileElement.style.color = styles.color;

    // Font size adjustments based on the values set in applyTileStyles
    if (value >= 1024) { tileElement.style.fontSize = '40px'; }
    else if (value >= 128) { tileElement.style.fontSize = '45px'; }
    else { tileElement.style.fontSize = '55px'; } // Base size from CSS
}

// --- Core Game Logic ---

// Processes a single row for movement (slide and merge) - DETAILED VERSION
// Returns an object {
//   actions: Array<{ type: 'move', from: number, to: number, value: number, id: number } | { type: 'merge', from1: number, from2: number, to: number, value: number, id1: number, id2: number }>,
//   finalRow: Array<number>, // The resulting row state
//   mergeScore: number
// }
function processRowDetailed(row) {
    const actions = [];
    const size = row.length;
    // Assign temporary unique IDs to track tiles even if their values are the same
    let nextId = 0;
    let tempRow = row.map((value, index) => (value ? { value, index, id: nextId++ } : null));
    let mergeScore = 0;

    // 1. Slide non-zero tiles left
    let currentWriteIndex = 0;
    for (let i = 0; i < size; i++) {
        if (tempRow[i]) {
            if (i !== currentWriteIndex) {
                // Record move action only if it actually shifts position
                actions.push({ type: 'move', from: tempRow[i].index, to: currentWriteIndex, value: tempRow[i].value, id: tempRow[i].id });
                tempRow[currentWriteIndex] = tempRow[i];
                tempRow[i] = null;
            }
            currentWriteIndex++;
        }
    }

    // 2. Merge adjacent equal tiles (from left to right)
    for (let i = 0; i < size - 1; i++) {
        if (tempRow[i] && tempRow[i+1] && tempRow[i].value === tempRow[i+1].value) {
            const mergedValue = tempRow[i].value * 2;
            mergeScore += mergedValue;

            // Record merge action
            actions.push({
                type: 'merge',
                from1: tempRow[i].index,     // Original index of the tile staying
                from2: tempRow[i+1].index,   // Original index of the tile merging
                to: i,                       // Target column index for the merged tile
                value: mergedValue,
                id1: tempRow[i].id,          // ID of the tile staying
                id2: tempRow[i+1].id         // ID of the tile merging
            });

            tempRow[i].value = mergedValue; // Update value of the tile that stays
            // tempRow[i].index = tempRow[i].index // Keep original index reference on the merged tile? Or update? Let's keep for now.
            tempRow[i+1] = null; // Remove the tile that merged into the first one

            // 3. Slide subsequent tiles left again after a merge
            for (let j = i + 2; j < size; j++) {
                 if (tempRow[j]) {
                    // Calculate the new target position (j-1)
                    const newTargetIndex = j - 1;
                    // Check if a move action for this tile (id) already exists to this position
                    let existingMoveIndex = actions.findIndex(a => a.type === 'move' && a.id === tempRow[j].id);
                    if (existingMoveIndex !== -1) {
                         // Update existing move action destination
                         actions[existingMoveIndex].to = newTargetIndex;
                    } else {
                         // Record new move action if it wasn't already moving
                         // This condition might need refinement - was it already at j?
                         if (tempRow[j].index !== j) { // Check if it wasn't originally at this spot before this slide phase
                            actions.push({ type: 'move', from: tempRow[j].index, to: newTargetIndex, value: tempRow[j].value, id: tempRow[j].id });
                         } else {
                             // If it WAS originally at j, and now moves to j-1, that's a new move
                             actions.push({ type: 'move', from: j, to: newTargetIndex, value: tempRow[j].value, id: tempRow[j].id });
                         }
                    }
                    // Perform the slide in the tempRow
                    tempRow[newTargetIndex] = tempRow[j];
                    tempRow[j] = null;
                 }
            }
        }
    }

    // Create the final row state array from the modified tempRow
    const finalRow = Array(size).fill(0);
    tempRow.forEach((tile, index) => {
         if(tile) finalRow[index] = tile.value;
    });


    // Filter out 'move' actions for tiles that were ultimately merged away (action.id === mergeAction.id2)
    const filteredActionsPass1 = actions.filter(action => {
        if (action.type === 'move') {
            const wasMergedAway = actions.some(mergeAction => mergeAction.type === 'merge' && mergeAction.id2 === action.id);
            return !wasMergedAway;
        }
        return true; // Keep all merge actions
    });

    // Filter out 'move' actions for tiles that end up merging (action.id === mergeAction.id1)
    // The merge action itself implies the movement to the final spot.
    const finalActions = filteredActionsPass1.filter(action => {
        if (action.type === 'move') {
             const subsequentlyMerged = filteredActionsPass1.some(mergeAction => mergeAction.type === 'merge' && mergeAction.id1 === action.id);
             return !subsequentlyMerged;
        }
        return true;
    });

    return { actions: finalActions, finalRow, mergeScore };
}

function handleInput(event) {
    if (isGameOver || isAnimating || !audioInitialized) return; // Don't handle input if game not started/over/animating
    // initAudioContext(); // Removed: Now called by start button

    let moveCalculationResult = null;

    switch (event.key) {
        case 'ArrowUp':
            moveCalculationResult = calculateMoveUp(grid);
            break;
        case 'ArrowDown':
            moveCalculationResult = calculateMoveDown(grid);
            break;
        case 'ArrowLeft':
            moveCalculationResult = calculateMoveLeft(grid);
            break;
        case 'ArrowRight':
            moveCalculationResult = calculateMoveRight(grid);
            break;
        default:
            return; // Ignore other keys
    }

    if (moveCalculationResult && moveCalculationResult.moved) {
        playMoveSound(); // Play sound effect on successful move calculation
        // Call animateMove which handles the animation and subsequent updates
        animateMove(
            moveCalculationResult.actions,
            moveCalculationResult.finalGrid,
            moveCalculationResult.scoreIncrease
        ).catch(error => {
             console.error("Animation failed:", error);
             // Fallback: Force state update and redraw
             isAnimating = false; // Ensure flag is reset on error
             grid = moveCalculationResult.finalGrid;
             score += moveCalculationResult.scoreIncrease;
             renderGrid(); // Full redraw
             updateScoreDisplay();
             if (!canMove() && !hasEmptyCells()) { gameOver(); } // Check game over after fallback
        });

    } else {
        // If no move was made, check if it's because no moves are possible
        if (!canMove() && !hasEmptyCells()) {
           gameOver();
        }
    }
}

// Calculates the result of moving left, without changing the global state.
// Returns { moved: boolean, finalGrid: array, actions: array, scoreIncrease: number }
function calculateMoveLeft(currentGrid) {
    console.log("Calculating move left for grid:", JSON.parse(JSON.stringify(currentGrid)));
    let moved = false;
    let scoreIncrease = 0;
    const actions = []; // All actions for the entire grid move
    const finalGrid = []; // The predicted grid state after the move

    for (let r = 0; r < gridSize; r++) {
        const originalRow = currentGrid[r];
        const result = processRowDetailed(originalRow); // Use the detailed version
        finalGrid.push(result.finalRow);
        scoreIncrease += result.mergeScore;

        // Add row context to actions
        result.actions.forEach(action => {
            console.log(`Row ${r}: Action calculated:`, action);
            actions.push({ ...action, row: r }); // Add row info
            moved = true; // Any action means something moved/merged
        });

        // Check if row changed even if no specific actions recorded (e.g. 2 0 0 0 -> 2 0 0 0)
        // This comparison might be redundant if processRowDetailed is robust
         if (!moved && originalRow.join(',') !== result.finalRow.join(',')) {
              console.log(`Row ${r} changed without actions?`, originalRow, result.finalRow);
              moved = true;
         }
    }

    console.log("CalculateMoveLeft result:", { moved, finalGrid, actions, scoreIncrease });
    return { moved, finalGrid, actions, scoreIncrease };
}

// Placeholder - Need to refactor moveRight, moveUp, moveDown similarly
function calculateMoveRight(currentGrid) {
    console.log("Calculating move right...");
    let moved = false;
    let scoreIncrease = 0;
    const actions = [];
    const finalGrid = [];

    for (let r = 0; r < gridSize; r++) {
        const originalRow = currentGrid[r];
        const reversedRow = [...originalRow].reverse(); // Work on a reversed copy
        const result = processRowDetailed(reversedRow);

        // Reverse the final row state back
        finalGrid.push(result.finalRow.reverse());
        scoreIncrease += result.mergeScore;

        // Translate actions from reversed coordinates to original coordinates
        result.actions.forEach(action => {
            moved = true; // Any action means movement
            const translatedAction = {
                ...action,
                row: r,
                // Translate column indices: new_c = gridSize - 1 - old_reversed_c
                from: gridSize - 1 - action.from,
                to: gridSize - 1 - action.to,
                // For merge, translate both from indices
                ...(action.type === 'merge' && { from1: gridSize - 1 - action.from1, from2: gridSize - 1 - action.from2 })
            };
            console.log(`Row ${r}: Right Action calculated (translated):`, translatedAction);
            actions.push(translatedAction);
        });
        if (!moved && originalRow.join(',') !== finalGrid[r].join(',')) {
             moved = true; // Catch cases where only order changed
        }
    }
    console.log("CalculateMoveRight result:", { moved, finalGrid, actions, scoreIncrease });
    return { moved, finalGrid, actions, scoreIncrease };
}

function calculateMoveUp(currentGrid) {
    console.log("Calculating move up...");
    // Add validation for currentGrid at the start
    if (!currentGrid || currentGrid.length !== gridSize || currentGrid.some(row => !row || row.length !== gridSize)) {
         console.error("calculateMoveUp received invalid currentGrid:", JSON.parse(JSON.stringify(currentGrid)));
         return { moved: false, finalGrid: currentGrid, actions: [], scoreIncrease: 0 }; // Return no move
    }

    let moved = false;
    let scoreIncrease = 0;
    const actions = [];
    let transposedGrid = transposeGrid(currentGrid);
    const finalTransposedGrid = [];

    for (let c = 0; c < gridSize; c++) { // Process columns as rows
        // Add check for the specific column (transposed row)
        if (!transposedGrid || !transposedGrid[c]) {
             console.error(`calculateMoveUp error: Transposed grid missing column ${c}`, JSON.parse(JSON.stringify(transposedGrid)));
             // Skip processing this column or handle error
             finalTransposedGrid.push(Array(gridSize).fill(0)); // Push an empty row to maintain structure
             continue; // Move to the next column
        }
        const originalCol = transposedGrid[c]; // This is effectively the column
        const result = processRowDetailed(originalCol);
        finalTransposedGrid.push(result.finalRow);
        scoreIncrease += result.mergeScore;

        // Translate actions from (col, row_within_col) to (row, col)
        result.actions.forEach(action => {
            moved = true;
            const translatedAction = {
                ...action,
                // Original action's 'row' is our column 'c'
                // Original action's 'from'/'to'/'from1'/'from2' are row indices
                row: action.from, // The original row
                col: c,           // The current column
                targetRow: action.to, // The target row within the column
                // Translate merge coordinates similarly
                ...(action.type === 'merge' && { from1Row: action.from1, from2Row: action.from2 })
            };
             console.log(`Col ${c}: Up Action calculated (translated):`, translatedAction);
            actions.push(translatedAction);
        });
        if (!moved && originalCol.join(',') !== result.finalRow.join(',')) {
             moved = true;
        }
    }

    // Transpose the final grid back to original orientation
    const finalGrid = transposeGrid(finalTransposedGrid);
    // Add validation for the final grid after transpose
    if (!finalGrid || finalGrid.length !== gridSize || finalGrid.some(row => !row || row.length !== gridSize)) {
        console.error("calculateMoveUp resulted in invalid finalGrid after transpose:", JSON.parse(JSON.stringify(finalGrid)), "From:", JSON.parse(JSON.stringify(finalTransposedGrid)));
        return { moved: false, finalGrid: currentGrid, actions: [], scoreIncrease: 0 }; // Return no move based on original grid
    }

    console.log("CalculateMoveUp result:", { moved, finalGrid, actions, scoreIncrease });
    return { moved, finalGrid, actions, scoreIncrease };
}

function calculateMoveDown(currentGrid) {
    console.log("Calculating move down...");
    let moved = false;
    let scoreIncrease = 0;
    const actions = [];
    let transposedGrid = transposeGrid(currentGrid);
    const finalTransposedGrid = [];

    for (let c = 0; c < gridSize; c++) { // Process columns as rows
        const originalCol = transposedGrid[c];
        const reversedCol = [...originalCol].reverse(); // Work on reversed column
        const result = processRowDetailed(reversedCol);

        // Reverse the final column state back
        finalTransposedGrid.push(result.finalRow.reverse());
        scoreIncrease += result.mergeScore;

        // Translate actions from (col, reversed_row_within_col) to (row, col)
        result.actions.forEach(action => {
            moved = true;
            // Translate row indices: real_row = gridSize - 1 - reversed_row
            const fromRow = gridSize - 1 - action.from;
            const toRow = gridSize - 1 - action.to;
            const from1Row = action.type === 'merge' ? gridSize - 1 - action.from1 : undefined;
            const from2Row = action.type === 'merge' ? gridSize - 1 - action.from2 : undefined;

            const translatedAction = {
                ...action,
                row: fromRow, // The original row
                col: c,       // The current column
                targetRow: toRow, // The target row
                // Add translated merge rows if applicable
                ...(action.type === 'merge' && { from1Row, from2Row })
            };
            console.log(`Col ${c}: Down Action calculated (translated):`, translatedAction);
            actions.push(translatedAction);
        });
         if (!moved && originalCol.join(',') !== finalTransposedGrid[c].join(',')) {
             moved = true;
        }
    }

    // Transpose the final grid back
    const finalGrid = transposeGrid(finalTransposedGrid);
    console.log("CalculateMoveDown result:", { moved, finalGrid, actions, scoreIncrease });
    return { moved, finalGrid, actions, scoreIncrease };
}

// Handles the animation based on calculated actions
async function animateMove(actions, finalGrid, scoreIncrease) {
    if (isAnimating) return; // Prevent overlapping animations
    isAnimating = true;
    console.log("--- Starting animateMove ---", actions);

    const animationPromises = [];
    const tilesToUpdate = new Map(); // Map to track merged tiles { 'r,c': newValue }
    const tilesToRemove = []; // DOM elements to remove after animation

    // Need layout info calculated here or passed in
    const gap = 10;
    const boardPadding = 10;
    const boardWidth = gameBoard.clientWidth || 400;
    const tileSize = (boardWidth - 2 * boardPadding - (gridSize - 1) * gap) / gridSize;

    // Create a temporary map of DOM tiles based on their ID from processRowDetailed if possible
    // This helps track tiles correctly even if their position in the 'tiles' array changes mid-animation
    const tileElementMap = new Map();
     for (let r = 0; r < gridSize; r++) {
         for (let c = 0; c < gridSize; c++) {
             if (tiles[r][c]) {
                 // We need a way to link the DOM element back to its temporary ID used in calculation
                 // Let's try adding a data attribute (could also use a WeakMap)
                 // This requires modification in createTile or renderGrid
                 // For now, we rely on the 'tiles' array state *before* animation starts
             }
         }
     }
     // Problem: If multiple tiles move in a row, updating tiles[r][to] = element might overwrite
     // Need a stable way to reference the DOM element corresponding to action.id

     // --- Let's rethink the update of the 'tiles' array ---
     // We should only update the 'tiles' array *after* all animations are done.
     // During animation, we use the 'tiles' array state *before* the move began.

    const currentTilesState = tiles.map(row => [...row]); // Shallow copy of rows, references are the same

    actions.forEach(action => {
        const { row, col } = action; // Get potential column info

        if (action.type === 'move') {
            const { from, to, value, id, targetRow } = action;
            let sourceRow, sourceCol, targetCol;
            if (col !== undefined) { // Up/Down move action structure
                sourceRow = action.row; // Actual source row
                sourceCol = col;
                targetCol = col;
                // targetRow is already the correct target row index
            } else { // Left/Right move action structure
                sourceRow = row;
                sourceCol = from;
                targetCol = to;
                // targetRow is not used here, derive from sourceRow
                // targetTop calculation uses sourceRow anyway
            }

             // Find the DOM element from its starting position in the pre-move state
            const tileElement = currentTilesState[sourceRow]?.[sourceCol]; // Use pre-move state

            if (tileElement) {
                console.log(`Animating MOVE: Tile ${value} from [${sourceRow},${sourceCol}] to [${targetRow !== undefined ? targetRow : sourceRow},${targetCol}]`, tileElement);
                // Calculate target position based on action type
                const targetTop = `${(targetRow !== undefined ? targetRow : sourceRow) * (tileSize + gap) + boardPadding}px`;
                const targetLeft = `${targetCol * (tileSize + gap) + boardPadding}px`;

                // Add promise that resolves when the transition ends for this specific element
                animationPromises.push(new Promise(resolve => {
                    const handler = (event) => {
                        // Ensure the event is for the transform/top/left property we changed
                        if (event.target === tileElement && (event.propertyName === 'top' || event.propertyName === 'left')) {
                             tileElement.removeEventListener('transitionend', handler);
                             console.log(`Transition END for MOVE: Tile ${value} at [${sourceRow},${sourceCol}] finished moving.`);
                             resolve();
                        }
                    };
                    tileElement.addEventListener('transitionend', handler);
                     // Fallback timeout in case transitionend doesn't fire reliably
                    setTimeout(() => {
                        tileElement.removeEventListener('transitionend', handler); // Clean up listener
                        resolve(); // Resolve anyway after timeout
                    }, 270); // Slightly longer than CSS transition
                }));

                // Apply styles to trigger transition
                tileElement.style.top = targetTop;
                tileElement.style.left = targetLeft;

            } else {
                console.warn(`Move action: Tile DOM element not found at start pos ${sourceRow}, ${sourceCol}`);
            }
        } else if (action.type === 'merge') {
            const { from1, from2, to, value, id1, id2, from1Row, from2Row, targetRow } = action;
            let s1Row, s1Col, s2Row, s2Col, tCol, tRow;

            if (col !== undefined) { // Up/Down merge action structure
                 s1Row = from1Row;
                 s1Col = col;
                 s2Row = from2Row;
                 s2Col = col;
                 tCol = col;
                 tRow = targetRow;
            } else { // Left/Right merge action structure
                 s1Row = row;
                 s1Col = from1;
                 s2Row = row;
                 s2Col = from2;
                 tCol = to;
                 tRow = row;
            }

            const tile1 = currentTilesState[s1Row]?.[s1Col]; // Tile that stays and updates
            const tile2 = currentTilesState[s2Row]?.[s2Col]; // Tile that moves and disappears

            if (tile1 && tile2) {
                 console.log(`Animating MERGE: Tile ${tile2.textContent} [${s2Row},${s2Col}] into Tile ${tile1.textContent} [${s1Row},${s1Col}] at [${tRow},${tCol}]`, tile1, tile2);
                // Calculate target position
                const targetTop = `${tRow * (tileSize + gap) + boardPadding}px`;
                const targetLeft = `${tCol * (tileSize + gap) + boardPadding}px`;

                // Ensure tile1 (staying tile) is visually on top
                tile1.style.zIndex = '10';
                tile2.style.zIndex = '5';

                 // Add promises for transitions
                animationPromises.push(new Promise(resolve => {
                    const handler = (event) => {
                         if (event.target === tile1 && (event.propertyName === 'top' || event.propertyName === 'left')) {
                            tile1.removeEventListener('transitionend', handler);
                            console.log(`Transition END for MERGE (tile1): Tile ${value} at [${tRow},${tCol}] finished.`);
                            resolve();
                        }
                    };
                    tile1.addEventListener('transitionend', handler);
                    setTimeout(() => {tile1.removeEventListener('transitionend', handler); resolve(); }, 270);
                }));
                animationPromises.push(new Promise(resolve => {
                     const handler = (event) => {
                          if (event.target === tile2 && (event.propertyName === 'top' || event.propertyName === 'left')) {
                             tile2.removeEventListener('transitionend', handler);
                            console.log(`Transition END for MERGE (tile2): Tile ${value} at [${tRow},${tCol}] finished.`);
                             resolve();
                         }
                     };
                     tile2.addEventListener('transitionend', handler);
                      setTimeout(() => {tile2.removeEventListener('transitionend', handler); resolve(); }, 270);
                }));

                // Move both tiles to the target position
                tile1.style.top = targetTop;
                tile1.style.left = targetLeft;
                tile2.style.top = targetTop;
                tile2.style.left = targetLeft;


                // Mark tile2 for removal after animation
                tilesToRemove.push(tile2);
                // Mark tile1 for value/style update after animation
                // Use target row/col for the key
                tilesToUpdate.set(`${tRow},${tCol}`, {element: tile1, newValue: value });


            } else {
                 console.warn(`Merge action: Tile DOM elements not found at [${s1Row},${s1Col}] or [${s2Row},${s2Col}]`);
            }
        }
    });

    // Wait for all move/merge animation promises to resolve
    await Promise.all(animationPromises);
    console.log("--- All CSS transitions awaited ---");


    // --- Post-Animation Updates ---
    console.log("Updating grid state, score, and DOM after animations.");

    // Update the global grid state *now*
    grid = finalGrid;

    // Update the global score *now*
    score += scoreIncrease;
    updateScoreDisplay();


     // Create the new 'tiles' array representing the final DOM state AFTER moves/merges
    const nextTilesState = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));

    // Place merged tiles first (they have definite positions)
    tilesToUpdate.forEach((updateInfo, key) => {
        const [r, c] = key.split(',').map(Number);
        if(r >= 0 && r < gridSize && c >= 0 && c < gridSize) { // Bounds check
             nextTilesState[r][c] = updateInfo.element;
             // Update the element's content and style
             updateInfo.element.className = 'tile'; // Reset classes
             updateInfo.element.classList.add(`tile-${updateInfo.newValue}`);
             updateInfo.element.textContent = updateInfo.newValue;
             updateInfo.element.style.zIndex = '1'; // Reset z-index
             applySingleTileStyle(updateInfo.element, updateInfo.newValue);
        } else {
            console.error("Merged tile update out of bounds:", r, c);
        }
    });

    // Place moved tiles
    actions.forEach(action => {
        if (action.type === 'move') {
            let sourceRow, sourceCol, targetRow, targetCol;
            if (action.col !== undefined) { // Up/Down move
                sourceRow = action.row;
                sourceCol = action.col;
                targetRow = action.targetRow;
                targetCol = action.col;
            } else { // Left/Right move
                sourceRow = action.row;
                sourceCol = action.from;
                targetRow = action.row;
                targetCol = action.to;
            }

            // Bounds check for source and target
            if (sourceRow >= 0 && sourceRow < gridSize && sourceCol >= 0 && sourceCol < gridSize &&
                targetRow >= 0 && targetRow < gridSize && targetCol >= 0 && targetCol < gridSize) {

                // Get the element from its *original* position before the move started
                const tileElement = currentTilesState[sourceRow]?.[sourceCol];

                if (tileElement) {
                     // Place if target not already filled (e.g., by a merge that landed here)
                     if (!nextTilesState[targetRow][targetCol]) {
                          nextTilesState[targetRow][targetCol] = tileElement;
                          tileElement.style.zIndex = '1'; // Reset z-index
                     } else {
                          // If the target is already filled (likely by a merge), this moved tile
                          // shouldn't be placed. It should have been part of the merge action's logic.
                          console.warn(`Target [${targetRow},${targetCol}] already filled during moved tile placement.`);
                     }
                } else {
                     console.warn(`Post-animation: Moved tile element not found at original [${sourceRow}, ${sourceCol}]`);
                }
            } else {
                 console.error("Moved tile action out of bounds:", {sourceRow, sourceCol, targetRow, targetCol});
            }
        }
    });

    // Place tiles that didn't move or merge
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            // If cell should have a tile according to final grid, but isn't filled in nextTilesState yet
            if (grid[r][c] !== 0 && !nextTilesState[r][c]) {
                // It must be a tile that existed before and didn't participate in actions
                const originalTile = currentTilesState[r]?.[c];
                if (originalTile && originalTile.textContent == grid[r][c]) {
                    // Check if this tile wasn't involved in a merge (as tile2)
                    const wasMergedAway = actions.some(a => a.type === 'merge' && ((a.col !== undefined && a.from2Row === r && a.col ===c) || (a.col === undefined && a.row === r && a.from2 === c)));
                    if (!wasMergedAway) {
                        nextTilesState[r][c] = originalTile;
                        originalTile.style.zIndex = '1'; // Reset z-index just in case
                    } else {
                         console.warn(`Tile at [${r},${c}] was detected as stationary but seems to have been merged away.`);
                    }
                } else {
                    // Fallback: Discrepancy found. Log error and potentially recreate.
                    console.error(`Post-animation: Unaccounted for tile at [${r},${c}] value ${grid[r][c]}. CurrentDOM:`, originalTile?.textContent);
                    // Maybe recreate the tile DOM element as a last resort?
                    // const gap = 10; const boardPadding = 10; const boardWidth = gameBoard.clientWidth || 400; const tileSize = (boardWidth - 2 * boardPadding - (gridSize - 1) * gap) / gridSize;
                    // createTile(r, c, grid[r][c], tileSize, gap, boardPadding); // createTile modifies global 'tiles'
                    // nextTilesState[r][c] = tiles[r][c]; // Try to get the newly created one
                }
            }
        }
    }

    // Assign the fully reconstructed state to the global 'tiles' array
    tiles = nextTilesState;

    // Remove the DOM elements of tiles that were merged away *after* reconstructing the state
    tilesToRemove.forEach(tile => tile.remove());

    // Add the new random tile (data)
    console.log("[AnimateMove] Before addRandomTile grid:", JSON.parse(JSON.stringify(grid)));
    addRandomTile(); // This updates the 'grid' array
    console.log("[AnimateMove] After addRandomTile grid:", JSON.parse(JSON.stringify(grid)));

    // Find where the new tile was added in the grid and create its DOM element
    let newTileR, newTileC, newValue;
    outerLoop:
    for(let r=0; r<gridSize; ++r) {
        for(let c=0; c<gridSize; ++c) {
             // Check if grid has a value but the corresponding 'tiles' DOM ref is null
            if(grid[r][c] !== 0 && !tiles[r][c]) {
                 console.log(`[AnimateMove] New tile data found in grid at [${r},${c}] with value ${grid[r][c]}`);
                 newTileR = r;
                 newTileC = c;
                 newValue = grid[r][c];
                 break outerLoop;
            }
        }
    }

    if (newTileR !== undefined) {
        console.log(`[AnimateMove] Creating DOM element for new tile at [${newTileR},${newTileC}], value ${newValue}`);
        // Create the new tile element (this also adds it to the 'tiles' array)
        const newTileElement = createTile(newTileR, newTileC, newValue, tileSize, gap, boardPadding);
        console.log("[AnimateMove] New tile DOM element created:", newTileElement, "tiles array updated?", tiles[newTileR]?.[newTileC] === newTileElement);

        // Add an appearance animation using the CSS class
        if (newTileElement) { // Ensure element exists before styling
            newTileElement.classList.add('tile-new');
            console.log("[AnimateMove] Added .tile-new class for appearance animation.");

            // Remove the class after the animation completes (250ms)
            setTimeout(() => {
                 if (newTileElement && newTileElement.parentNode) { // Check if element still exists
                      console.log(`[AnimateMove] Removing .tile-new class for new tile at [${newTileR},${newTileC}]`);
                      newTileElement.classList.remove('tile-new');
                      // Ensure opacity and transform are reset to default .tile styles if needed
                      // (though the animation's 'to' state should handle this)
                 } else {
                      console.warn(`[AnimateMove] New tile element at [${newTileR},${newTileC}] no longer exists when removing .tile-new class.`);
                 }
            }, 250); // Match animation duration
        } else {
             console.error("[AnimateMove] createTile returned null/undefined for the new tile.")
        }
    } else {
         console.error("[AnimateMove] Could not find the position of the newly added random tile in the grid/tiles comparison.");
         // Log the state for debugging
         console.log("[AnimateMove] Final grid state when new tile not found:", JSON.parse(JSON.stringify(grid)));
         console.log("[AnimateMove] Final tiles DOM state when new tile not found:", tiles);
    }

    // Check for game over after all updates
    if (!canMove() && !hasEmptyCells()) {
        gameOver();
    }

    console.log("--- Animation complete. isAnimating = false. Final tiles array: ---", tiles);
    isAnimating = false; // Allow next input
}

// Processes a single row for movement (slide and merge) - OLD VERSION for non-animated directions
// Returns an object { newRow: array, mergeScore: number }
function processRow(row) {
    // ... (Keep the OLD implementation for calculateMoveRight/Up/Down until they are refactored) ...
    let filteredRow = row.filter(val => val !== 0);
    let mergeScore = 0;
    for (let i = 0; i < filteredRow.length - 1; i++) {
        if (filteredRow[i] === filteredRow[i + 1]) {
            filteredRow[i] *= 2;
            mergeScore += filteredRow[i];
            filteredRow.splice(i + 1, 1);
        }
    }
    const newRow = Array(gridSize).fill(0);
    for (let i = 0; i < filteredRow.length; i++) {
        newRow[i] = filteredRow[i];
    }
    return { newRow, mergeScore };
}

// Helper function to transpose the grid (swap rows and columns)
function transposeGrid(matrix) {
    // Defensive check for valid input matrix
    if (!matrix || matrix.length === 0 || !matrix[0] || matrix.some(row => !row || row.length !== matrix[0].length)) {
        console.error("transposeGrid called with invalid matrix:", JSON.parse(JSON.stringify(matrix)));
        // Return an empty grid of the expected size or handle error appropriately
        // Returning null/empty might cause downstream errors, maybe return original?
        // Let's return a default empty grid for now to avoid crashing, but this indicates a deeper issue.
        return Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    }
    // Original transpose logic
    try {
        return matrix[0].map((col, i) => matrix.map(row => row[i]));
    } catch (e) {
        console.error("Error during transposeGrid execution:", e, "Input matrix:", JSON.parse(JSON.stringify(matrix)));
        // Return default grid on error
        return Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    }
}

// --- Game Over Logic ---
function hasEmptyCells() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] === 0) {
                return true;
            }
        }
    }
    return false;
}

function canMove() {
    // Check for possible merges horizontally
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize - 1; c++) {
            if (grid[r][c] === grid[r][c + 1]) {
                return true;
            }
        }
    }
    // Check for possible merges vertically
    for (let c = 0; c < gridSize; c++) {
        for (let r = 0; r < gridSize - 1; r++) {
            if (grid[r][c] === grid[r + 1][c]) {
                return true;
            }
        }
    }
    // Check if there are empty cells (implies a move is possible)
    if (hasEmptyCells()) {
        return true;
    }

    return false; // No moves possible
}

function gameOver() {
    isGameOver = true;
    console.log("Game Over!");

    // Display Game Over message with restart button
    const gameOverDiv = document.createElement('div');
    gameOverDiv.id = 'game-over-message';
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
    restartButton.style.padding = '10px 20px';
    restartButton.style.fontSize = '18px';
    restartButton.style.backgroundColor = '#8f7a66';
    restartButton.style.color = '#f9f6f2';
    restartButton.style.border = 'none';
    restartButton.style.borderRadius = '3px';
    restartButton.style.cursor = 'pointer';
    restartButton.onclick = () => {
        playFanfare(); // Play fanfare on restart
        initGrid(); // Restart the game
    };

    gameOverDiv.appendChild(message);
    gameOverDiv.appendChild(restartButton);
    gameBoard.appendChild(gameOverDiv);
}

function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = score;
}

// --- AI Help Logic ---

function simulateMove(direction) {
    // Deep copy the current grid and score to avoid modifying the actual game state
    const tempGrid = JSON.parse(JSON.stringify(grid)); // Simple deep copy for 2D array
    let tempScore = 0; // Simulate score gain for THIS move only
    let moved = false;

    // Helper to process a row and update simulated state
    const simProcessRow = (row) => {
        let filtered = row.filter(v => v !== 0);
        let mergeScore = 0;
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i+1]) {
                filtered[i] *= 2;
                mergeScore += filtered[i];
                filtered.splice(i+1, 1);
            }
        }
        const newRow = Array(gridSize).fill(0);
        filtered.forEach((v, i) => newRow[i] = v);
        return { newRow, mergeScore };
    };

    // Simulate the move
    if (direction === 'left') {
        for (let r = 0; r < gridSize; r++) {
            const res = simProcessRow(tempGrid[r]);
            if (tempGrid[r].join(',') !== res.newRow.join(',')) moved = true;
            tempScore += res.mergeScore;
            tempGrid[r] = res.newRow;
        }
    } else if (direction === 'right') {
        for (let r = 0; r < gridSize; r++) {
            const reversed = [...tempGrid[r]].reverse();
            const res = simProcessRow(reversed);
            const finalRow = res.newRow.reverse();
            if (tempGrid[r].join(',') !== finalRow.join(',')) moved = true;
            tempScore += res.mergeScore;
            tempGrid[r] = finalRow;
        }
    } else if (direction === 'up' || direction === 'down') {
        let transposed = transposeGrid(tempGrid);
        for (let r = 0; r < gridSize; r++) {
            const rowToProcess = (direction === 'up') ? [...transposed[r]] : [...transposed[r]].reverse();
            const res = simProcessRow(rowToProcess);
            const finalRow = (direction === 'up') ? res.newRow : res.newRow.reverse();
            // Only check moved status based on original transposed row vs final row
            if (transposed[r].join(',') !== finalRow.join(',')) moved = true;
            tempScore += res.mergeScore;
            transposed[r] = finalRow;
        }
        // Transpose back only if needed (moved check is done before transposing back)
        Object.assign(tempGrid, transposeGrid(transposed)); // Modify tempGrid in place
    }

    // Calculate empty cells in the resulting grid
    let emptyCells = 0;
    if (moved) {
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (tempGrid[r][c] === 0) {
                    emptyCells++;
                }
            }
        }
    }

    return { moved, score: tempScore, emptyCells };
}

function getBestMove() {
    const moves = ['up', 'down', 'left', 'right'];
    let bestMove = null;
    let bestScore = -1;
    let maxEmptyCells = -1;

    moves.forEach(direction => {
        const result = simulateMove(direction);

        if (result.moved) {
            // Prioritize higher score, then more empty cells
            if (result.score > bestScore) {
                bestScore = result.score;
                maxEmptyCells = result.emptyCells;
                bestMove = direction;
            } else if (result.score === bestScore) {
                if (result.emptyCells > maxEmptyCells) {
                    maxEmptyCells = result.emptyCells;
                    bestMove = direction;
                }
            }
        }
    });
    console.log("Best move calculated:", bestMove, "Score:", bestScore, "Empty Cells:", maxEmptyCells);
    return bestMove;
}

function executeHelpMove() {
    if (isGameOver || isAnimating || !audioInitialized) return; // Don't run if game not started
    // initAudioContext(); // Removed: Now called by start button

    const bestMoveDirection = getBestMove(); // Simulation logic might need update later

    if (bestMoveDirection) {
        let moveCalculationResult = null;
        switch (bestMoveDirection) {
            // Use the calculate functions
            case 'up':    moveCalculationResult = calculateMoveUp(grid); break;
            case 'down':  moveCalculationResult = calculateMoveDown(grid); break;
            case 'left':  moveCalculationResult = calculateMoveLeft(grid); break;
            case 'right': moveCalculationResult = calculateMoveRight(grid); break;
        }

        if (moveCalculationResult && moveCalculationResult.moved) {
             playMoveSound(); // Play sound effect for help move
             // Trigger animation
             animateMove(
                 moveCalculationResult.actions, // Note: Actions might be empty for non-refactored directions
                 moveCalculationResult.finalGrid,
                 moveCalculationResult.scoreIncrease
             ).catch(error => {
                 console.error("Help Animation failed:", error);
                 isAnimating = false;
                 // Fallback
                 grid = moveCalculationResult.finalGrid;
                 score += moveCalculationResult.scoreIncrease;
                 renderGrid(); // Full redraw
                 updateScoreDisplay();
                 if (!canMove() && !hasEmptyCells()) { gameOver(); }
             });
        } else {
            console.warn("Help button suggested a move, but calculation resulted in no change? Move:", bestMoveDirection);
        }
    } else {
        console.log("Help button: No beneficial moves found.");
    }
}

// --- Initialization --- (Now mostly handled by start button)

function startGame() {
    console.log("Start button clicked.");
    // 1. Initialize Audio
    initAudioContext();

    // 2. Hide overlay and show game
    if (startOverlay) startOverlay.style.display = 'none';
    if (gameContainer) gameContainer.style.visibility = 'visible';

    // 3. Initialize the game board and state
    initGrid();

    // 4. Add game event listeners only AFTER start
    document.addEventListener('keydown', handleInput);
    const helpButton = document.getElementById('help-button');
    if (helpButton) { helpButton.addEventListener('click', executeHelpMove); }

    console.log('Game initialized and started.');
}

document.addEventListener('DOMContentLoaded', () => {
    // Apply base styles that might be needed before start
    applyTileStyles();

    // Get start button and add listener
    if (startButton) {
        startButton.addEventListener('click', startGame);
    } else {
        console.error("Start button not found!");
        // As a fallback, maybe show the game immediately?
        if (gameContainer) gameContainer.style.visibility = 'visible';
        initGrid(); // Initialize grid anyway
    }
});

// Function to initialize audio context on first user interaction (now the start button click)
function initAudioContext() {
    if (audioInitialized) return;
    console.log("Initializing audio context via Start Button...");
    audioInitialized = true;

    // Play fanfare first using the dedicated function
    playFanfare();

    // Attempt to unlock with move sound as fallback if fanfare might have failed silently
    if(moveAudio) {
        moveAudio.play().then(()=>moveAudio.pause()).catch(()=>{/* ignore error */});
    }

    // Still try to start background music regardless of fanfare success
    startBackgroundMusic();
}

// Function to start background music (called after context is likely unlocked)
function startBackgroundMusic() {
    if (backgroundAudio) {
        console.log("Attempting to start background music...");
        backgroundAudio.volume = 0.3; // Set volume before playing
        backgroundAudio.play().then(() => {
            console.log("Background music started.");
        }).catch(error => {
            console.warn("Background music playback failed even after interaction:", error);
        });
    } else {
         console.warn("Background audio element not found.");
    }
}

// Function to play the move sound
function playMoveSound() {
    if (!audioInitialized) {
        console.warn("playMoveSound called before audio context initialized.");
        return; // Don't try playing if context isn't ready
    }
    if (moveAudio) {
        moveAudio.pause(); // Stop if already playing
        moveAudio.currentTime = 0; // Rewind to start
        moveAudio.play().catch(error => {
            console.warn("Move sound playback failed:", error);
        });
    } else {
        console.warn("Move audio element not found.")
    }
}

// Separate function to play fanfare (can be called from multiple places)
function playFanfare() {
     if (audioInitialized && fanfareAudio) {
         console.log("Attempting to play fanfare...");
         fanfareAudio.pause();
         fanfareAudio.currentTime = 0;
         fanfareAudio.play().catch(error => {
             console.warn("Fanfare playback failed:", error);
         });
     } else if (!audioInitialized) {
          console.warn("Cannot play fanfare: Audio context not initialized.");
     } else {
          console.warn("Fanfare audio element not found.");
     }
} 