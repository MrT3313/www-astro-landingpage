import React, { useState, useEffect, useRef } from 'react';
import MockTerminal from './MockTerminal.jsx';

// A* Pathfinding Algorithm
class PathFinder {
  constructor(grid, walls) {
    this.grid = grid;
    this.walls = new Set(walls.map(([x, y]) => `${x},${y}`));
    this.searchSteps = [];
  }

  heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  getNeighbors(node, cols, rows) {
    const neighbors = [];
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    
    for (const [dx, dy] of directions) {
      const x = node.x + dx;
      const y = node.y + dy;
      if (x >= 0 && x < cols && y >= 0 && y < rows && !this.walls.has(`${x},${y}`)) {
        neighbors.push({ x, y });
      }
    }
    return neighbors;
  }

  findPath(start, end, cols, rows) {
    const openSet = [start];
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const key = (node) => `${node.x},${node.y}`;
    
    gScore.set(key(start), 0);
    fScore.set(key(start), this.heuristic(start, end));

    while (openSet.length > 0) {
      openSet.sort((a, b) => (fScore.get(key(a)) ?? Infinity) - (fScore.get(key(b)) ?? Infinity));
      const current = openSet.shift();
      
      closedSet.add(key(current));
      this.searchSteps.push({ x: current.x, y: current.y });

      if (current.x === end.x && current.y === end.y) {
        const path = [];
        let temp = current;
        while (cameFrom.has(key(temp))) {
          path.unshift(temp);
          temp = cameFrom.get(key(temp));
        }
        path.unshift(start);
        return { path, searchSteps: this.searchSteps };
      }

      for (const neighbor of this.getNeighbors(current, cols, rows)) {
        if (closedSet.has(key(neighbor))) {
          continue;
        }
        
        const tentativeGScore = (gScore.get(key(current)) ?? Infinity) + 1;
        const currentGScore = gScore.get(key(neighbor)) ?? Infinity;
        
        if (tentativeGScore < currentGScore) {
          cameFrom.set(key(neighbor), current);
          gScore.set(key(neighbor), tentativeGScore);
          fScore.set(key(neighbor), tentativeGScore + this.heuristic(neighbor, end));
          
          const alreadyInOpen = openSet.some(n => n.x === neighbor.x && n.y === neighbor.y);
          
          if (!alreadyInOpen) {
            openSet.push(neighbor);
          }
        }
      }
    }
    return { path: [], searchSteps: this.searchSteps };
  }
}

export default function LandingPage() {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [cellSize, setCellSize] = useState(40);
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

  // Calculate grid dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setDimensions({ width, height });

        const targetCellSize = width < 768 ? 30 : width < 1200 ? 35 : 40;
        const cols = Math.floor(width / targetCellSize);
        const rows = Math.floor(height / targetCellSize);
        
        const actualCellSize = cols > 0 ? width / cols : targetCellSize;
        setCellSize(actualCellSize);
        setGrid({ cols, rows });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

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
    if (grid.cols === 0 || grid.rows === 0 || terminalBounds.width === 0) return;
    if (hasStartedRef.current) return;
    
    hasStartedRef.current = true;
    console.log('🔵 SETUP: Generating grid...');

    const newWalls = [];
    const totalCells = grid.cols * grid.rows;
    const terminalCells = terminalBounds.width * terminalBounds.height;
    const availableCells = totalCells - terminalCells;
    const numWalls = Math.floor(availableCells * 0.35);
    
    for (let i = 0; i < numWalls; i++) {
      const point = getRandomPoint(newWalls);
      newWalls.push([point.x, point.y]);
    }
    
    setDynamicWalls(newWalls);
    
    // Get start and end points that are NOT on walls
    const start = getRandomPoint(newWalls);
    const end = getRandomPoint(newWalls);
    
    setStartPoint(start);
    setEndPoint(end);
    setSearchedNodes([]);
    setFinalPath([]);
    setIsWiping(false);
    setCurrentSearchIndex(0);
    setCurrentPathIndex(0);

    const wallSet = [...newWalls, ...Array.from({ length: terminalBounds.height }, (_, i) => 
      Array.from({ length: terminalBounds.width }, (_, j) => 
        [terminalBounds.x + j, terminalBounds.y + i]
      )
    ).flat()];
    
    console.log('Grid:', grid.cols, 'x', grid.rows);
    console.log('Start:', start);
    console.log('End:', end);
    console.log('Walls:', newWalls.length, 'random walls +', terminalBounds.width * terminalBounds.height, 'terminal cells =', wallSet.length, 'total walls');
    
    const pathFinder = new PathFinder(grid, wallSet);
    const result = pathFinder.findPath(start, end, grid.cols, grid.rows);
    
    console.log('Result:', result);
    console.log('Path length:', result.path.length);
    console.log('Search steps:', result.searchSteps.length);
    
    if (result.path.length === 0) {
      console.log('❌ No path found, retrying...');
      hasStartedRef.current = false;
      setTimeout(() => {
        setPhase('RETRY');
        setTimeout(() => setPhase('SETUP'), 50);
      }, 500);
      return;
    }

    console.log('✅ Path found! Search steps:', result.searchSteps.length, 'Path nodes:', result.path.length);
    
    allSearchStepsRef.current = result.searchSteps;
    allPathNodesRef.current = result.path;

    console.log('🟢 Immediately changing to SEARCHING phase');
    setPhase('SEARCHING');

  }, [phase, grid, terminalBounds]);

  // SEARCHING - animate search nodes one by one
  useEffect(() => {
    if (phase !== 'SEARCHING') return;
    
    console.log('📊 SEARCHING - showing node', currentSearchIndex, 'of', allSearchStepsRef.current.length);
    
    if (currentSearchIndex >= allSearchStepsRef.current.length) {
      console.log('🟡 Search complete! Moving to PATH phase');
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
  }, [phase, currentSearchIndex, searchSpeed]);

  // PATH - animate path nodes one by one
  useEffect(() => {
    if (phase !== 'PATH') return;
    
    console.log('📈 PATH - showing node', currentPathIndex, 'of', allPathNodesRef.current.length);
    
    if (currentPathIndex >= allPathNodesRef.current.length) {
      console.log('🟣 Path complete! Moving to PAUSE');
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
  }, [phase, currentPathIndex, pathSpeed]);

  // PAUSE - show complete result
  useEffect(() => {
    if (phase !== 'PAUSE') return;
    
    console.log('⏸️  PAUSE - Showing complete path for 2 seconds');
    
    const timer = setTimeout(() => {
      console.log('🔴 WIPE - Starting transition');
      setPhase('WIPE');
      setIsWiping(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [phase]);

  // WIPE - clear and restart
  useEffect(() => {
    if (phase !== 'WIPE') return;
    
    console.log('💫 WIPE - Clearing screen');
    
    const timer = setTimeout(() => {
      console.log('🔄 RESTART - Going back to SETUP');
      hasStartedRef.current = false;
      setPhase('SETUP');
    }, 800);
    
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div 
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-black"
      style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}
    >
      <div className="absolute inset-0">
        <svg width={dimensions.width} height={dimensions.height} className="absolute inset-0">
          <defs>
            <pattern id="grid" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
              <path 
                d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} 
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
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
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
                x={node.x * cellSize + cellSize * 0.1}
                y={node.y * cellSize + cellSize * 0.1}
                width={cellSize * 0.8}
                height={cellSize * 0.8}
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
                cx={startPoint.x * cellSize + cellSize / 2}
                cy={startPoint.y * cellSize + cellSize / 2}
                r={cellSize / 2.5}
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
                cx={endPoint.x * cellSize + cellSize / 2}
                cy={endPoint.y * cellSize + cellSize / 2}
                r={cellSize / 2.5}
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
                x={node.x * cellSize + cellSize * 0.1}
                y={node.y * cellSize + cellSize * 0.1}
                width={cellSize * 0.8}
                height={cellSize * 0.8}
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

      <MockTerminal terminalBounds={terminalBounds} cellSize={cellSize} />

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