import React, { useState, useEffect, useRef } from 'react';
import MockTerminal from './MockTerminal';
import { AStarSearch } from '../../algorithms/search/index';
import { calculateTerminalBounds } from './utils/terminalSizing';
import type { Node, Grid, Wall } from '../../algorithms/search/types/index';
import { Github, Linkedin, Mail, FileText, type LucideIcon } from 'lucide-react';
import cx from 'classnames';

interface LandingPageProps {
  debug?: boolean;
  searchAlgorithm?: typeof AStarSearch;
}

interface SocialNode {
  id: string;
  x: number;
  y: number;
  icon: LucideIcon;
  url: string;
  label: string;
}

// Configuration for your social links
const SOCIAL_LINKS = [
  { id: 'github', icon: Github, url: 'https://github.com/MrT3313', label: 'GitHub' },
  { id: 'linkedin', icon: Linkedin, url: 'https://www.linkedin.com/in/reedturgeon/', label: 'LinkedIn' },
  { id: 'email', icon: Mail, url: 'mailto:rturgeon@iu.edu', label: 'rturgeon@iu.edu' },
  // { id: 'resume', icon: FileText, url: '/resume.pdf', label: 'Resume' },
];

export default function LandingPage({ debug = false, searchAlgorithm = AStarSearch }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [cellWidth, setCellWidth] = useState(40);
  const [cellHeight, setCellHeight] = useState(40);
  const [grid, setGrid] = useState<Grid>({ cols: 0, rows: 0 });
  
  // State for grid items
  const [dynamicWalls, setDynamicWalls] = useState<Wall[]>([]);
  const [socialNodes, setSocialNodes] = useState<SocialNode[]>([]);
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
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        
        if (!isResizing) {
          if (debug) console.log('🟠 RESIZE START - Dimensions changed');
          setIsResizing(true);
        }
        
        resizeTimeout = setTimeout(() => {
          if (debug) console.log('🟠 RESIZE END - Resizing stopped');
          setIsResizing(false);
          
          const newDims = updateDimensions();
          if (newDims) {
            initialDimensionsRef.current = newDims;
          }
          
          hasStartedRef.current = false;
          setPhase('SETUP');
          setSearchedNodes([]);
          setFinalPath([]);
          setSocialNodes([]);
          setIsWiping(false);
          setCurrentSearchIndex(0);
          setCurrentPathIndex(0);
          
          // FIX: Do NOT clear refs here. It causes race conditions if the animation loop
          // runs one last time before the state updates.
          // allSearchStepsRef.current = [];
          // allPathNodesRef.current = [];
        }, 500);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [isResizing, debug]);

  // Calculate terminal bounds
  useEffect(() => {
    if (grid.cols > 0 && grid.rows > 0) {
      setTerminalBounds(calculateTerminalBounds(grid, window.innerWidth));
    }
  }, [grid]);

  const isWall = (x: number, y: number, walls: Wall[]) => {
    return walls.some(([wx, wy]: Wall) => wx === x && wy === y);
  };

  // SETUP - only runs once when grid is ready
  useEffect(() => {
    if (phase !== 'SETUP') return;
    if (grid.cols === 0 || grid.rows === 0) return;
    if (hasStartedRef.current) return;
    if (isResizing) return; 
    
    hasStartedRef.current = true;
    if (debug) console.log('🔵 SETUP: Generating grid...');

    // FIX: Clear refs HERE, synchronously, before generating new data.
    allSearchStepsRef.current = [];
    allPathNodesRef.current = [];

    // 1. Calculate terminal bounds
    const currentTerminalBounds = calculateTerminalBounds(grid, window.innerWidth);
    setTerminalBounds(currentTerminalBounds);
    
    // Helper to check if a specific cell is inside the terminal
    const isInCurrentTerminal = (x: number, y: number) => {
      return x >= currentTerminalBounds.x && x < currentTerminalBounds.x + currentTerminalBounds.width &&
             y >= currentTerminalBounds.y && y < currentTerminalBounds.y + currentTerminalBounds.height;
    };

    // Helper to check if a 2x2 area is clear (not terminal, not wall)
    const isAreaClear = (x: number, y: number, currentWalls: Wall[]) => {
      // Check bounds
      if (x + 1 >= grid.cols || y + 1 >= grid.rows) return false;
      
      const points = [
        { x, y }, { x: x + 1, y }, 
        { x, y: y + 1 }, { x: x + 1, y: y + 1 }
      ];

      return points.every(p => 
        !isInCurrentTerminal(p.x, p.y) && 
        !isWall(p.x, p.y, currentWalls)
      );
    };
    
    const randomWalls: Wall[] = [];
    const socialBlockers: Wall[] = []; // These are walls ONLY for pathfinding, not for rendering
    const placedSocialNodes: SocialNode[] = [];

    // 2. Place Social Icons First
    SOCIAL_LINKS.forEach(link => {
      let attempts = 0;
      let placed = false;
      
      while (!placed && attempts < 500) {
        // Random position (ensure room for 2x2)
        const x = Math.floor(Math.random() * (grid.cols - 1));
        const y = Math.floor(Math.random() * (grid.rows - 1));
        
        // We check against 'randomWalls' (empty now) and 'socialBlockers'
        if (isAreaClear(x, y, [...randomWalls, ...socialBlockers])) {
          // Place the node
          placedSocialNodes.push({
            ...link,
            x,
            y
          });
          
          socialBlockers.push([x, y] as Wall);
          socialBlockers.push([x + 1, y] as Wall);
          socialBlockers.push([x, y + 1] as Wall);
          socialBlockers.push([x + 1, y + 1] as Wall);
          
          placed = true;
        }
        attempts++;
      }
    });

    setSocialNodes(placedSocialNodes);

    // 3. Fill remaining space with random walls
    const totalCells = grid.cols * grid.rows;
    const terminalCells = currentTerminalBounds.width * currentTerminalBounds.height;
    const socialCells = placedSocialNodes.length * 4; 
    
    const availableCells = totalCells - terminalCells - socialCells;
    const numRandomWalls = Math.floor(availableCells * 0.30);
    
    const getRandomPointInCurrentGrid = (existingObstacles: Wall[]) => {
      let x, y;
      let attempts = 0;
      do {
        x = Math.floor(Math.random() * grid.cols);
        y = Math.floor(Math.random() * grid.rows);
        attempts++;
      } while ((isInCurrentTerminal(x, y) || isWall(x, y, existingObstacles)) && attempts < 1000);
      return { x, y };
    };

    // We generate walls, ensuring they don't hit socialBlockers
    for (let i = 0; i < numRandomWalls; i++) {
      const point = getRandomPointInCurrentGrid([...randomWalls, ...socialBlockers]);
      randomWalls.push([point.x, point.y] as Wall);
    }
    
    // Only set the random walls to state (these are the ones that will render gray)
    setDynamicWalls(randomWalls);
    
    // 4. Place Start and End points (avoiding all obstacles)
    const allObstacles = [...randomWalls, ...socialBlockers];
    const start = getRandomPointInCurrentGrid(allObstacles);
    const end = getRandomPointInCurrentGrid(allObstacles);
    
    setStartPoint(start);
    setEndPoint(end);
    setSearchedNodes([]);
    setFinalPath([]);
    setIsWiping(false);
    setCurrentSearchIndex(0);
    setCurrentPathIndex(0);

    // 5. Run Search
    // Combine ALL obstacles: random walls + icon hidden walls + terminal walls
    const fullWallSetForSearch: Wall[] = [...allObstacles, ...Array.from({ length: currentTerminalBounds.height }, (_, i) => 
      Array.from({ length: currentTerminalBounds.width }, (_, j) => 
        [currentTerminalBounds.x + j, currentTerminalBounds.y + i] as Wall
      )
    ).flat()];
    
    const pathFinder = new searchAlgorithm(grid, fullWallSetForSearch);
    const result = pathFinder.findPath(start, end, grid.cols, grid.rows);
    
    if (result.path.length === 0) {
      if (debug) console.log('❌ No path found, retrying...');
      hasStartedRef.current = false;
      setTimeout(() => {
        setPhase('RETRY');
        setTimeout(() => setPhase('SETUP'), 50);
      }, 500);
      return;
    }

    if (debug) console.log('✅ Path found!');
    
    allSearchStepsRef.current = result.searchSteps;
    allPathNodesRef.current = result.path;

    setPhase('SEARCHING');

  }, [phase, grid, isResizing, searchAlgorithm, debug]);

  // SEARCHING - animate search nodes one by one
  useEffect(() => {
    if (phase !== 'SEARCHING') return;
    if (isResizing) return;

    // Guard Clause for Race Condition
    // If refs are empty but phase is SEARCHING, abort to avoid freeze/crash
    if (!allSearchStepsRef.current || allSearchStepsRef.current.length === 0) {
      if (debug) console.warn('⚠️ Search steps lost during animation. Resetting...');
      setPhase('SETUP');
      hasStartedRef.current = false;
      return;
    }
    
    if (currentSearchIndex >= allSearchStepsRef.current.length) {
      setPhase('PATH');
      return;
    }
    
    const nextNode = allSearchStepsRef.current[currentSearchIndex];
    
    // Safety check ensuring node exists
    if (nextNode) {
      setSearchedNodes(prev => [...prev, nextNode]);
    }
    
    const timer = setTimeout(() => {
      setCurrentSearchIndex(prev => prev + 1);
    }, searchSpeed);
    
    return () => clearTimeout(timer);
  }, [phase, currentSearchIndex, searchSpeed, isResizing, debug]);

  // PATH - animate path nodes one by one
  useEffect(() => {
    if (phase !== 'PATH') return;
    if (isResizing) return;

    // Safety Guard for Path as well
    if (!allPathNodesRef.current || allPathNodesRef.current.length === 0) {
        setPhase('PAUSE'); // Skip to pause if path data lost
        return;
    }
    
    if (currentPathIndex >= allPathNodesRef.current.length) {
      setPhase('PAUSE');
      return;
    }
    
    const nextNode = allPathNodesRef.current[currentPathIndex];
    
    // Safety check
    if (nextNode) {
      setFinalPath(prev => [...prev, nextNode]);
    }
    
    const timer = setTimeout(() => {
      setCurrentPathIndex(prev => prev + 1);
    }, pathSpeed);
    
    return () => clearTimeout(timer);
  }, [phase, currentPathIndex, pathSpeed, isResizing]);

  // PAUSE - show complete result
  useEffect(() => {
    if (phase !== 'PAUSE') return;
    if (isResizing) return;
    
    const timer = setTimeout(() => {
      setPhase('WIPE');
      setIsWiping(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [phase, isResizing]);

  // WIPE - clear and restart
  useEffect(() => {
    if (phase !== 'WIPE') return;
    if (isResizing) return;
    
    const timer = setTimeout(() => {
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

  useEffect(() => {
    let wheelTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) return;
      if (window.scrollY > 50) return;
      
      if (e.deltaY > 0) {
        if (wheelTimeout) clearTimeout(wheelTimeout);
        
        wheelTimeout = setTimeout(() => {
          scrollToEducationPath();
        }, 100);
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: true });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimeout) clearTimeout(wheelTimeout);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
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
          
          {/* Walls - ONLY rendering the random walls, not social blockers */}
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
          
          {/* Social Icons - Rendered over the grid */}
          {socialNodes.map((node) => {
            const Icon = node.icon;
            return (
              <foreignObject
                key={node.id}
                x={node.x * cellWidth}
                y={node.y * cellHeight}
                width={cellWidth * 2}
                height={cellHeight * 2}
                className="transition-all duration-300"
                style={{ 
                  opacity: isWiping ? 0 : 1,
                  pointerEvents: isWiping ? 'none' : 'all',
                  borderRadius: '5px',
                  overflow: 'visible'
                }}
              >
                <div 
                  onClick={() => window.open(node.url, '_blank')}
                  className="w-full h-full flex items-center justify-center cursor-pointer group relative"
                  style={{ overflow: 'visible' }}
                >
                  {/* Solid Black Backdrop: Covers grid lines, no border */}
                  <div className={cx(
                    "absolute", 
                    "inset-0", 
                    "bg-[#fff]/70", 
                    "rounded-sm")} 
                  />
                  
                  {/* The Icon */}
                  <Icon 
                    className="relative z-10 w-8 h-8 text-black group-hover:scale-110 transition-all duration-200" 
                    strokeWidth={1.5}
                  />
                  
                  {/* Tooltip Label */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap bg-black px-2.5 py-1.5 rounded shadow-lg z-50">
                    {node.label}
                  </div>
                </div>
              </foreignObject>
            );
          })}

          {/* Searched nodes */}
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
          
          {/* Final path */}
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

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div 
          className="scroll-indicator"
          onClick={scrollToEducationPath}
          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        >
          <svg 
            width={45} 
            height={45} 
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