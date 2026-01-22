import React, { useState, useEffect, useRef } from 'react';
import MockTerminal from './MockTerminal.js';
import { AStarSearch } from '../../algorithms/search/index';

export default function LandingPage({ debug = false, searchAlgorithm = AStarSearch }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [cellSize, setCellSize] = useState(40);
  const [cellWidth, setCellWidth] = useState(40);
  const [cellHeight, setCellHeight] = useState(40);
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });
  const [dynamicWalls, setDynamicWalls] = useState([]);
  const [terminalBounds, setTerminalBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [searchedNodes, setSearchedNodes] = useState([]);
  const [finalPath, setFinalPath] = useState([]);
  const [isWiping, setIsWiping] = useState(false);
  const [searchSpeed, setSearchSpeed] = useState(250);
  const [pathSpeed, setPathSpeed] = useState(100);
  
  // Store complete data
  const allSearchStepsRef = useRef([]);
  const allPathNodesRef = useRef([]);
  
  // Current index being displayed
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  
  // Phase control
  const [phase, setPhase] = useState('SETUP');
  const hasStartedRef = useRef(false);
  
  // Resize handling
  const [isResizing, setIsResizing] = useState(false);
  const initialDimensionsRef = useRef({ width: 0, height: 0 });

  // Calculate grid dimensions
  const updateDimensions = () => {
    if (containerRef.current) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });

      const targetCellSize = width < 768 ? 30 : width < 1200 ? 35 : 40;
      const cols = Math.floor(width / targetCellSize);
      const rows = Math.floor(height / targetCellSize);
      
      // Calculate exact cell dimensions to fill viewport perfectly
      const cWidth = width / cols;
      const cHeight = height / rows;
      
      setCellWidth(cWidth);
      setCellHeight(cHeight);
      setCellSize(cWidth); // Keep for backwards compatibility
      setGrid({ cols, rows });
      
      return { width, height };
    }
    return null;
  };

  // Initial setup
  useEffect(() => {
    const dims = updateDimensions();
    if (dims) {
      initialDimensionsRef.current = dims;
    }
  }, []);

  // Detect resize with debounce
  useEffect(() => {
    let resizeTimeout = null;
    
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Check if dimensions actually changed significantly (more than 5px)
      const widthChanged = Math.abs(width - initialDimensionsRef.current.width) > 5;
      const heightChanged = Math.abs(height - initialDimensionsRef.current.height) > 5;
      
      if (widthChanged || heightChanged) {
        // Clear existing timeout
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        
        // Start pausing if not already
        if (!isResizing) {
          if (debug) console.log('🟠 RESIZE START - Dimensions changed');
          setIsResizing(true);
        }
        
        // Set timeout to end resize (500ms after last resize event)
        resizeTimeout = setTimeout(() => {
          if (debug) console.log('🟠 RESIZE END - Resizing stopped');
          setIsResizing(false);
          
          // Update dimensions
          const newDims = updateDimensions();
          if (newDims) {
            initialDimensionsRef.current = newDims;
          }
          
          // Reset everything
          hasStartedRef.current = false;
          setPhase('SETUP');
          setSearchedNodes([]);
          setFinalPath([]);
          setIsWiping(false);
          setCurrentSearchIndex(0);
          setCurrentPathIndex(0);
          allSearchStepsRef.current = [];
          allPathNodesRef.current = [];
        }, 500);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [isResizing]);

  // Calculate terminal bounds
  useEffect(() => {
    if (grid.cols > 0 && grid.rows > 0) {
      let terminalCols = Math.floor(grid.cols * 0.7);
      const terminalRows = Math.min(Math.floor(grid.rows * 0.40), 10);
      
      const totalSpacing = grid.cols - terminalCols;
      if (totalSpacing % 2 !== 0) {
        terminalCols = terminalCols - 1;
      }
      
      const startX = (grid.cols - terminalCols) / 2;
      const startY = Math.floor((grid.rows - terminalRows) / 2);
      
      setTerminalBounds({
        x: startX,
        y: startY,
        width: terminalCols,
        height: terminalRows
      });
    }
  }, [grid]);

  const isInTerminal = (x, y) => {
    return x >= terminalBounds.x && x < terminalBounds.x + terminalBounds.width &&
           y >= terminalBounds.y && y < terminalBounds.y + terminalBounds.height;
  };

  const isWall = (x, y, walls) => {
    return walls.some(([wx, wy]) => wx === x && wy === y);
  };

  const getRandomPoint = (walls) => {
    let x, y;
    let attempts = 0;
    do {
      x = Math.floor(Math.random() * grid.cols);
      y = Math.floor(Math.random() * grid.rows);
      attempts++;
    } while ((isInTerminal(x, y) || isWall(x, y, walls)) && attempts < 1000);
    return { x, y };
  };

  // SETUP - only runs once when grid is ready
  useEffect(() => {
    if (phase !== 'SETUP') return;
    if (grid.cols === 0 || grid.rows === 0) return;
    if (hasStartedRef.current) return;
    if (isResizing) return; // Don't start if resizing
    
    hasStartedRef.current = true;
    if (debug) console.log('🔵 SETUP: Generating grid...');

    // Calculate terminal bounds FIRST, synchronously
    let terminalCols = Math.floor(grid.cols * 0.5);
    const terminalRows = Math.min(Math.floor(grid.rows * 0.40), 10);
    
    const totalSpacing = grid.cols - terminalCols;
    if (totalSpacing % 2 !== 0) {
      terminalCols = terminalCols - 1;
    }
    
    const startX = (grid.cols - terminalCols) / 2;
    const startY = Math.floor((grid.rows - terminalRows) / 2);
    
    const currentTerminalBounds = {
      x: startX,
      y: startY,
      width: terminalCols,
      height: terminalRows
    };
    
    // Update terminal bounds state
    setTerminalBounds(currentTerminalBounds);
    
    // Helper function using the CURRENT terminal bounds
    const isInCurrentTerminal = (x, y) => {
      return x >= currentTerminalBounds.x && x < currentTerminalBounds.x + currentTerminalBounds.width &&
             y >= currentTerminalBounds.y && y < currentTerminalBounds.y + currentTerminalBounds.height;
    };
    
    const getRandomPointInCurrentGrid = (walls) => {
      let x, y;
      let attempts = 0;
      do {
        x = Math.floor(Math.random() * grid.cols);
        y = Math.floor(Math.random() * grid.rows);
        attempts++;
      } while ((isInCurrentTerminal(x, y) || isWall(x, y, walls)) && attempts < 1000);
      return { x, y };
    };

    const newWalls = [];
    const totalCells = grid.cols * grid.rows;
    const terminalCells = currentTerminalBounds.width * currentTerminalBounds.height;
    const availableCells = totalCells - terminalCells;
    const numWalls = Math.floor(availableCells * 0.35);
    
    for (let i = 0; i < numWalls; i++) {
      const point = getRandomPointInCurrentGrid(newWalls);
      newWalls.push([point.x, point.y]);
    }
    
    setDynamicWalls(newWalls);
    
    // Get start and end points that are NOT on walls
    const start = getRandomPointInCurrentGrid(newWalls);
    const end = getRandomPointInCurrentGrid(newWalls);
    
    setStartPoint(start);
    setEndPoint(end);
    setSearchedNodes([]);
    setFinalPath([]);
    setIsWiping(false);
    setCurrentSearchIndex(0);
    setCurrentPathIndex(0);

    const wallSet = [...newWalls, ...Array.from({ length: currentTerminalBounds.height }, (_, i) => 
      Array.from({ length: currentTerminalBounds.width }, (_, j) => 
        [currentTerminalBounds.x + j, currentTerminalBounds.y + i]
      )
    ).flat()];
    
    if (debug) {
      console.log('Grid:', grid.cols, 'x', grid.rows);
      console.log('Start:', start);
      console.log('End:', end);
      console.log('Walls:', newWalls.length, 'random walls +', currentTerminalBounds.width * currentTerminalBounds.height, 'terminal cells =', wallSet.length, 'total walls');
    }
    
    const pathFinder = new searchAlgorithm(grid, wallSet);
    const result = pathFinder.findPath(start, end, grid.cols, grid.rows);
    
    if (debug) {
      console.log('Result:', result);
      console.log('Path length:', result.path.length);
      console.log('Search steps:', result.searchSteps.length);
    }
    
    if (result.path.length === 0) {
      if (debug) console.log('❌ No path found, retrying...');
      hasStartedRef.current = false;
      setTimeout(() => {
        setPhase('RETRY');
        setTimeout(() => setPhase('SETUP'), 50);
      }, 500);
      return;
    }

    if (debug) console.log('✅ Path found! Search steps:', result.searchSteps.length, 'Path nodes:', result.path.length);
    
    allSearchStepsRef.current = result.searchSteps;
    allPathNodesRef.current = result.path;

    if (debug) console.log('🟢 Immediately changing to SEARCHING phase');
    setPhase('SEARCHING');

  }, [phase, grid, isResizing]);

  // SEARCHING - animate search nodes one by one
  useEffect(() => {
    if (phase !== 'SEARCHING') return;
    if (isResizing) return; // Pause during resize
    
    if (debug) console.log('📊 SEARCHING - showing node', currentSearchIndex, 'of', allSearchStepsRef.current.length);
    
    if (currentSearchIndex >= allSearchStepsRef.current.length) {
      if (debug) console.log('🟡 Search complete! Moving to PATH phase');
      setPhase('PATH');
      return;
    }
    
    // Add the next searched node
    const nextNode = allSearchStepsRef.current[currentSearchIndex];
    setSearchedNodes(prev => [...prev, nextNode]);
    
    // Schedule next node
    const timer = setTimeout(() => {
      setCurrentSearchIndex(prev => prev + 1);
    }, searchSpeed);
    
    return () => clearTimeout(timer);
  }, [phase, currentSearchIndex, searchSpeed, isResizing]);

  // PATH - animate path nodes one by one
  useEffect(() => {
    if (phase !== 'PATH') return;
    if (isResizing) return; // Pause during resize
    
    if (debug) console.log('📈 PATH - showing node', currentPathIndex, 'of', allPathNodesRef.current.length);
    
    if (currentPathIndex >= allPathNodesRef.current.length) {
      if (debug) console.log('🟣 Path complete! Moving to PAUSE');
      setPhase('PAUSE');
      return;
    }
    
    // Add the next path node
    const nextNode = allPathNodesRef.current[currentPathIndex];
    setFinalPath(prev => [...prev, nextNode]);
    
    // Schedule next node
    const timer = setTimeout(() => {
      setCurrentPathIndex(prev => prev + 1);
    }, pathSpeed);
    
    return () => clearTimeout(timer);
  }, [phase, currentPathIndex, pathSpeed, isResizing]);

  // PAUSE - show complete result
  useEffect(() => {
    if (phase !== 'PAUSE') return;
    if (isResizing) return; // Pause during resize
    
    if (debug) console.log('⏸️  PAUSE - Showing complete path for 2 seconds');
    
    const timer = setTimeout(() => {
      if (debug) console.log('🔴 WIPE - Starting transition');
      setPhase('WIPE');
      setIsWiping(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [phase, isResizing]);

  // WIPE - clear and restart
  useEffect(() => {
    if (phase !== 'WIPE') return;
    if (isResizing) return; // Pause during resize
    
    if (debug) console.log('💫 WIPE - Clearing screen');
    
    const timer = setTimeout(() => {
      if (debug) console.log('🔄 RESTART - Going back to SETUP');
      hasStartedRef.current = false;
      setPhase('SETUP');
    }, 800);
    
    return () => clearTimeout(timer);
  }, [phase, isResizing]);

  return (
    <div 
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-black"
      style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}
    >
      <div className="absolute inset-0">
        <svg 
          width={dimensions.width} 
          height={dimensions.height} 
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="absolute inset-0"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="grid" width={cellWidth} height={cellHeight} patternUnits="userSpaceOnUse">
              <path 
                d={`M ${cellWidth} 0 L 0 0 0 ${cellHeight}`} 
                fill="none" 
                stroke="rgba(100, 116, 139, 0.4)" 
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Walls - Grey with no borders, only background grid visible */}
          {dynamicWalls.map(([x, y], idx) => (
            <rect
              key={`wall-${idx}`}
              x={x * cellWidth}
              y={y * cellHeight}
              width={cellWidth}
              height={cellHeight}
              fill="rgba(71, 85, 105, 0.65)"
              className="transition-all duration-300"
              style={{ opacity: isWiping ? 0 : 1 }}
            />
          ))}
          
          {/* Searched nodes - with fade animation */}
          {searchedNodes.map((node, idx) => {
            const isStart = startPoint && node.x === startPoint.x && node.y === startPoint.y;
            const isEnd = endPoint && node.x === endPoint.x && node.y === endPoint.y;
            if (isStart || isEnd) return null;
            
            return (
              <rect
                key={`searched-${idx}`}
                x={node.x * cellWidth + cellWidth * 0.1}
                y={node.y * cellHeight + cellHeight * 0.1}
                width={cellWidth * 0.8}
                height={cellHeight * 0.8}
                fill="rgba(34, 197, 94, 0.35)"
                stroke="rgba(34, 197, 94, 0.6)"
                strokeWidth="1.5"
                rx="2"
                className="searched-node"
                style={{ 
                  opacity: isWiping ? 0 : 1,
                  animation: 'searchFade 3s ease-out forwards'
                }}
              />
            );
          })}
          
          {/* Start point */}
          {startPoint && (
            <g className="transition-opacity duration-300" style={{ opacity: isWiping ? 0 : 1 }}>
              <circle
                cx={startPoint.x * cellWidth + cellWidth / 2}
                cy={startPoint.y * cellHeight + cellHeight / 2}
                r={Math.min(cellWidth, cellHeight) / 2.5}
                fill="rgba(59, 130, 246, 0.6)"
                stroke="rgba(59, 130, 246, 1)"
                strokeWidth="2"
              />
            </g>
          )}
          
          {/* End point */}
          {endPoint && (
            <g className="transition-opacity duration-300" style={{ opacity: isWiping ? 0 : 1 }}>
              <circle
                cx={endPoint.x * cellWidth + cellWidth / 2}
                cy={endPoint.y * cellHeight + cellHeight / 2}
                r={Math.min(cellWidth, cellHeight) / 2.5}
                fill="rgba(168, 85, 247, 0.6)"
                stroke="rgba(168, 85, 247, 1)"
                strokeWidth="2"
              />
            </g>
          )}
          
          {/* Final path - pulsing gold cells */}
          {finalPath.map((node, idx) => {
            const isStart = startPoint && node.x === startPoint.x && node.y === startPoint.y;
            const isEnd = endPoint && node.x === endPoint.x && node.y === endPoint.y;
            if (isStart || isEnd) return null;
            
            return (
              <rect
                key={`path-${idx}`}
                x={node.x * cellWidth + cellWidth * 0.1}
                y={node.y * cellHeight + cellHeight * 0.1}
                width={cellWidth * 0.8}
                height={cellHeight * 0.8}
                fill="rgba(234, 179, 8, 0.7)"
                stroke="rgba(250, 204, 21, 1)"
                strokeWidth="2"
                rx="2"
                className="path-node"
                style={{ 
                  opacity: isWiping ? 0 : 1,
                  animation: 'pathPulse 1.5s ease-in-out infinite'
                }}
              />
            );
          })}
        </svg>
        
        {isWiping && (
          <div className="absolute inset-0 bg-black animate-[wipeOut_0.8s_ease-in-out]" />
        )}
      </div>

      <MockTerminal 
        terminalBounds={terminalBounds} 
        cellWidth={cellWidth} 
        cellHeight={cellHeight} 
      />

      <div className="absolute inset-0 pointer-events-none z-20 opacity-5"
           style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 197, 94, 0.1) 2px, rgba(34, 197, 94, 0.1) 4px)' }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        
        @keyframes wipeOut {
          0% { clip-path: circle(0% at 50% 50%); }
          100% { clip-path: circle(150% at 50% 50%); }
        }
        
        @keyframes searchFade {
          0% {
            fill: rgba(34, 197, 94, 0.9);
            stroke: rgba(34, 197, 94, 1);
            filter: brightness(1.5);
          }
          100% {
            fill: rgba(34, 197, 94, 0.35);
            stroke: rgba(34, 197, 94, 0.6);
            filter: brightness(1);
          }
        }
        
        @keyframes pathPulse {
          0%, 100% {
            fill: rgba(234, 179, 8, 0.7);
            stroke: rgba(250, 204, 21, 1);
            filter: brightness(1);
            transform: scale(1);
          }
          50% {
            fill: rgba(234, 179, 8, 0.95);
            stroke: rgba(250, 204, 21, 1);
            filter: brightness(1.3) drop-shadow(0 0 8px rgba(250, 204, 21, 0.8));
            transform: scale(1.05);
          }
        }
        
        .path-node {
          transform-origin: center;
          transform-box: fill-box;
        }
        
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
}