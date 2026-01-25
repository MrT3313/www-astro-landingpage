import React, { useState, useEffect, useRef } from 'react';
import MockTerminal from './MockTerminal';
import { AStarSearch } from '../../algorithms/search/index';
import { calculateTerminalBounds } from './utils/terminalSizing';
import type { Node, Grid, Wall } from '../../algorithms/search/types/index';
import cx from 'classnames';
interface LandingPageProps {
  debug?: boolean;
  searchAlgorithm?: typeof AStarSearch;
}

export default function LandingPage({ debug = false, searchAlgorithm = AStarSearch }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [cellWidth, setCellWidth] = useState(40);
  const [cellHeight, setCellHeight] = useState(40);
  const [grid, setGrid] = useState<Grid>({ cols: 0, rows: 0 });
  const [dynamicWalls, setDynamicWalls] = useState<Wall[]>([]);
  const [terminalBounds, setTerminalBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [startPoint, setStartPoint] = useState<Node | null>(null);
  const [endPoint, setEndPoint] = useState<Node | null>(null);
  const [searchedNodes, setSearchedNodes] = useState<Node[]>([]);
  const [finalPath, setFinalPath] = useState<Node[]>([]);
  const [isWiping, setIsWiping] = useState(false);
  const [searchSpeed, setSearchSpeed] = useState(250);
  const [pathSpeed, setPathSpeed] = useState(100);
  
  // Store complete data
  const allSearchStepsRef = useRef<Node[]>([]);
  const allPathNodesRef = useRef<Node[]>([]);
  
  // Current index being displayed
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  
  // Phase control
  const [phase, setPhase] = useState('SETUP');
  const hasStartedRef = useRef(false);
  
  // Resize handling
  const [isResizing, setIsResizing] = useState(false);
  const initialDimensionsRef = useRef({ width: 0, height: 0 });

  // Scroll handling
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate grid dimensions
  const updateDimensions = () => {
    if (containerRef.current) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });

      const targetCellSize = 25
      const cols = Math.floor(width / targetCellSize);
      const rows = Math.floor(height / targetCellSize);
      
      // Calculate exact cell dimensions to fill viewport perfectly
      const cWidth = width / cols;
      const cHeight = height / rows;
      
      setCellWidth(cWidth);
      setCellHeight(cHeight);
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
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    
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
      setTerminalBounds(calculateTerminalBounds(grid, window.innerWidth));
    }
  }, [grid]);

  const isInTerminal = (x: number, y: number) => {
    return x >= terminalBounds.x && x < terminalBounds.x + terminalBounds.width &&
           y >= terminalBounds.y && y < terminalBounds.y + terminalBounds.height;
  };

  const isWall = (x: number, y: number, walls: Wall[]) => {
    return walls.some(([wx, wy]: Wall) => wx === x && wy === y);
  };

  const getRandomPoint = (walls: Wall[]) => {
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
    const currentTerminalBounds = calculateTerminalBounds(grid, window.innerWidth);
    
    // Update terminal bounds state
    setTerminalBounds(currentTerminalBounds);
    
    // Helper function using the CURRENT terminal bounds
    const isInCurrentTerminal = (x: number, y: number) => {
      return x >= currentTerminalBounds.x && x < currentTerminalBounds.x + currentTerminalBounds.width &&
             y >= currentTerminalBounds.y && y < currentTerminalBounds.y + currentTerminalBounds.height;
    };
    
    const getRandomPointInCurrentGrid = (walls: Wall[]) => {
      let x, y;
      let attempts = 0;
      do {
        x = Math.floor(Math.random() * grid.cols);
        y = Math.floor(Math.random() * grid.rows);
        attempts++;
      } while ((isInCurrentTerminal(x, y) || isWall(x, y, walls)) && attempts < 1000);
      return { x, y };
    };

    const newWalls: Wall[] = [];
    const totalCells = grid.cols * grid.rows;
    const terminalCells = currentTerminalBounds.width * currentTerminalBounds.height;
    const availableCells = totalCells - terminalCells;
    const numWalls = Math.floor(availableCells * 0.35);
    
    for (let i = 0; i < numWalls; i++) {
      const point = getRandomPointInCurrentGrid(newWalls);
      newWalls.push([point.x, point.y] as Wall);
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

    const wallSet: Wall[] = [...newWalls, ...Array.from({ length: currentTerminalBounds.height }, (_, i) => 
      Array.from({ length: currentTerminalBounds.width }, (_, j) => 
        [currentTerminalBounds.x + j, currentTerminalBounds.y + i] as Wall
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

  const scrollToEducationPath = () => {
    if (isScrollingRef.current) return;
    
    const educationPathContainer = document.getElementById('education-path-container');
    if (!educationPathContainer) return;
    
    isScrollingRef.current = true;
    const rect = educationPathContainer.getBoundingClientRect();
    const targetScrollY = rect.top + window.scrollY;
    
    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000);
  };

  const scrollToEmploymentPath = () => {
    if (isScrollingRef.current) return;
    
    const educationPathContainer = document.getElementById('education-path-container');
    if (!educationPathContainer) return;
    
    isScrollingRef.current = true;
    const rect = educationPathContainer.getBoundingClientRect();
    const targetScrollY = rect.top + window.scrollY;
    
    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000);
  };

  useEffect(() => {
    let wheelTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) return;
      if (window.scrollY > 50) return;
      
      if (e.deltaY > 0) {
        if (wheelTimeout) {
          clearTimeout(wheelTimeout);
        }
        
        wheelTimeout = setTimeout(() => {
          scrollToEducationPath();
        }, 100);
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: true });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimeout) {
        clearTimeout(wheelTimeout);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden bg-black"
      style={{ 
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        width: '100vw',
        height: '100vh'
      }}
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
                stroke="var(--color-grid-border)"
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
              fill="var(--color-grid-fill)"
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
                fill="var(--color-grid-cell-resting)"
                stroke="var(--color-grid-cell-selected)"
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
                fill="var(--color-grid-start-cell-fill)"
                stroke="var(--color-grid-start-cell-border)"
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
                fill="var(--color-grid-end-cell-fill)"
                stroke="var(--color-grid-end-cell-border)"
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
                fill="var(--color-grid-cell-path-resting)"
                stroke="var(--color-grid-cell-path-selected)"
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

      {/* <div className="absolute inset-0 pointer-events-none z-20 opacity-5"
           style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 197, 94, 0.1) 2px, rgba(34, 197, 94, 0.1) 4px)' }} /> */}

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div 
          className="scroll-indicator"
          onClick={scrollToEmploymentPath}
          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        >
          <svg 
            width="45" 
            height="45" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="scroll-arrow"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes wipeOut {
          0% { clip-path: circle(0% at 50% 50%); }
          100% { clip-path: circle(150% at 50% 50%); }
        }
        
        @keyframes searchFade {
          0% {
            fill: var(--color-grid-cell-resting);
            stroke: var(--color-grid-cell-selected);
            filter: brightness(1.5);
          }
          100% {
            fill: var(--color-grid-cell-resting);
            stroke: var(--color-grid-cell-selected);
            filter: brightness(1);
          }
        }
        
        @keyframes pathPulse {
          0%, 100% {
            fill: var(--color-grid-cell-path-resting);
            stroke: var(--color-grid-cell-path-selected);
            filter: brightness(1);
            transform: scale(1);
          }
          50% {
            fill: var(--color-grid-cell-path-resting);
            stroke: var(--color-grid-cell-path-selected);
            filter: brightness(1.3) drop-shadow(0 0 8px rgba(250, 204, 21, 0.8));
            transform: scale(1.05);
          }
        }
        
        @keyframes bounceArrow {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.8;
          }
          50% {
            transform: translateY(8px);
            opacity: 1;
          }
        }
        
        .scroll-indicator {
          animation: bounceArrow 2s ease-in-out infinite;
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