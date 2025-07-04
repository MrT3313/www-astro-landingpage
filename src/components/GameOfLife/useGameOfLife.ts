import { useState, useEffect, useRef, useCallback } from 'react'
import type { GameGrid, GameState, GameOfLifeConfig } from './types'
import { 
  createEmptyGrid, 
  createRandomGrid, 
  getNextGeneration, 
  toggleCell, 
  clearGrid,
  getGridDimensions 
} from './gameLogic'

// Constant for exact 1-second interval
const ONE_SECOND = 1000;

// Helper function to check if two game grids are identical
const areGridsEqual = (gridA: GameGrid, gridB: GameGrid): boolean => {
  if (gridA.width !== gridB.width || gridA.height !== gridB.height) {
    return false;
  }
  
  for (let y = 0; y < gridA.height; y++) {
    for (let x = 0; x < gridA.width; x++) {
      if (gridA.cells[y][x] !== gridB.cells[y][x]) {
        return false;
      }
    }
  }
  
  return true;
};

export const useGameOfLife = (canvasWidth: number, canvasHeight: number, config: GameOfLifeConfig) => {
  // Store entire game state in a ref to avoid re-renders
  const gameStateRef = useRef<GameState>({
    grid: createEmptyGrid(1, 1), // Default empty grid
    generation: 0,
    isPlaying: false,
    speed: ONE_SECOND,
    isGameOver: false
  });
  
  // Expose a limited version of the state to React for UI updates
  const [displayState, setDisplayState] = useState<GameState>(gameStateRef.current);
  
  // Interval timer ref
  const timerRef = useRef<number | null>(null);
  // Track last update time
  const lastUpdateRef = useRef<number>(0);

  // Initialize game state once
  useEffect(() => {
    // Only initialize if we have valid dimensions
    if (canvasWidth <= 0 || canvasHeight <= 0) return;
    
    const { width, height } = getGridDimensions(canvasWidth, canvasHeight, config.cellSize);
    const grid = createRandomGrid(width, height, config.initialDensity);
    
    // Initialize state
    gameStateRef.current = {
      grid,
      generation: 0,
      isPlaying: config.autoPlay,
      speed: ONE_SECOND, // Always use 1 second
      isGameOver: false
    };
    
    // Update display state
    setDisplayState({...gameStateRef.current});
    
  }, [canvasWidth, canvasHeight, config.cellSize, config.initialDensity, config.autoPlay]);

  // Process one generation
  const processGeneration = useCallback(() => {
    const now = Date.now();
    const currentGen = gameStateRef.current.generation;
    const elapsed = now - lastUpdateRef.current;
    const currentGrid = gameStateRef.current.grid;
    
    // Calculate the next generation
    const nextGrid = getNextGeneration(currentGrid);
    
    // Check if the game has reached a stable state (no changes between generations)
    const gameHasEnded = areGridsEqual(currentGrid, nextGrid);
    
    if (gameHasEnded) {
      // Stop the game loop
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    // Update the game state
    gameStateRef.current = {
      ...gameStateRef.current,
      grid: nextGrid,
      generation: currentGen + 1,
      isPlaying: gameHasEnded ? false : gameStateRef.current.isPlaying,
      isGameOver: gameHasEnded
    };
    
    // Update display state
    setDisplayState({...gameStateRef.current});
    
    // Update the last update time
    lastUpdateRef.current = now;
  }, []);

  // Start the game loop
  const startGameLoop = useCallback(() => {
    // Don't start if already running
    if (timerRef.current !== null) return;
    
    // Reset game over state when starting
    gameStateRef.current.isGameOver = false;
    
    lastUpdateRef.current = Date.now();
    
    // Use setInterval for precise timing
    timerRef.current = window.setInterval(() => {
      processGeneration();
    }, ONE_SECOND);
    
    // Update play state
    gameStateRef.current.isPlaying = true;
    setDisplayState({...gameStateRef.current});
  }, [processGeneration]);

  // Stop the game loop
  const stopGameLoop = useCallback(() => {
    if (timerRef.current === null) return;
    
    window.clearInterval(timerRef.current);
    timerRef.current = null;
    
    // Update play state
    gameStateRef.current.isPlaying = false;
    setDisplayState({...gameStateRef.current});
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    // If game is over, reset before starting again
    if (gameStateRef.current.isGameOver) {
      resetGrid();
      return;
    }
    
    if (gameStateRef.current.isPlaying) {
      stopGameLoop();
    } else {
      startGameLoop();
    }
  }, [startGameLoop, stopGameLoop]);

  // Advance one generation manually
  const nextGeneration = useCallback(() => {
    // Don't advance if game is over
    if (gameStateRef.current.isGameOver) return;
    
    processGeneration();
  }, [processGeneration]);

  // Reset grid to new random state
  const resetGrid = useCallback((width: number = canvasWidth, height: number = canvasHeight) => {
    if (width <= 0 || height <= 0) return;
    
    const dims = getGridDimensions(width, height, config.cellSize);
    const newGrid = createRandomGrid(dims.width, dims.height, config.initialDensity);
    
    // Update game state
    gameStateRef.current = {
      ...gameStateRef.current,
      grid: newGrid,
      generation: 0,
      isGameOver: false
    };
    
    // Update display state
    setDisplayState({...gameStateRef.current});
  }, [canvasWidth, canvasHeight, config.cellSize, config.initialDensity]);

  // Clear all cells
  const clearAllCells = useCallback(() => {
    // Get current grid dimensions
    const { width, height } = gameStateRef.current.grid;
    
    // Update game state
    gameStateRef.current = {
      ...gameStateRef.current,
      grid: clearGrid(gameStateRef.current.grid),
      generation: 0,
      isGameOver: false
    };
    
    // Update display state
    setDisplayState({...gameStateRef.current});
  }, []);

  // Toggle a cell state on click
  const handleCellClick = useCallback((x: number, y: number) => {
    // Ensure coordinates are valid
    const { width, height } = gameStateRef.current.grid;
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    
    // Reset game over state when user interacts with the grid
    const isGameOver = gameStateRef.current.isGameOver;
    
    // Update game state
    gameStateRef.current = {
      ...gameStateRef.current,
      grid: toggleCell(gameStateRef.current.grid, x, y),
      isGameOver: false
    };
    
    // Update display state
    setDisplayState({...gameStateRef.current});
  }, []);

  // Set speed (always 1 second in this version)
  const setSpeed = useCallback((_newSpeed: number) => {
    // Do nothing - speed is fixed at 1 second
  }, []);

  // Resize grid
  const resizeGrid = useCallback((newWidth: number, newHeight: number) => {
    if (newWidth <= 0 || newHeight <= 0) return;
    
    // Stop game loop if running
    if (gameStateRef.current.isPlaying) {
      stopGameLoop();
    }
    
    // Reset with new dimensions
    resetGrid(newWidth, newHeight);
  }, [resetGrid, stopGameLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Handle play state changes
  useEffect(() => {
    if (displayState.isPlaying && timerRef.current === null) {
      startGameLoop();
    } else if (!displayState.isPlaying && timerRef.current !== null) {
      stopGameLoop();
    }
  }, [displayState.isPlaying, startGameLoop, stopGameLoop]);

  return {
    gameState: displayState,
    actions: {
      togglePlay,
      nextGeneration,
      resetGrid,
      clearAllCells,
      handleCellClick,
      setSpeed,
      resizeGrid
    }
  };
}; 