/**
 * Terminal Sizing Utility
 * 
 * Drop-in replacement for the terminal bounds calculation.
 * Uses Tailwind-style breakpoints for responsive sizing.
 * 
 * USAGE:
 * 1. Import: import { calculateTerminalBounds } from './terminalSizing';
 * 2. Replace your inline calculation with:
 *    const bounds = calculateTerminalBounds(grid, window.innerWidth);
 *    // bounds = { x, y, width, height }
 */

interface Grid {
    cols: number;
    rows: number;
}
  
interface TerminalBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}
  
interface BreakpointConfig {
    marginCols?: number;
    widthPercent?: number;
    minCols: number;
    maxCols: number | null;
    marginRows?: number;
    heightPercent?: number;
    minRows: number;
    maxRows: number;
}
  
type BreakpointName = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
// Tailwind breakpoints (in pixels)
const BREAKPOINTS: Record<Exclude<BreakpointName, 'xs'>, number> = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
};
  
/**
 * Terminal sizing config per breakpoint
 * 
 * - marginCols: Fixed cells on each side (small screens)
 * - widthPercent: Percentage of grid width (larger screens)
 * - minCols/maxCols: Width constraints
 * - marginRows: Fixed cells on top/bottom (small screens)  
 * - heightPercent: Percentage of grid height (larger screens)
 * - minRows/maxRows: Height constraints
 */
const TERMINAL_CONFIG: Record<BreakpointName, BreakpointConfig> = {
    // < 640px - phones portrait
    xs: {
        marginCols: 3,
        minCols: 8,
        maxCols: null,
        marginRows: 2,
        minRows: 8,
        maxRows: 8,
    },
    
    // 640-767px - phones landscape
    sm: {
        marginCols: 3,
        minCols: 12,
        maxCols: null,
        marginRows: 2,
        minRows: 8,
        maxRows: 8,
    },
    
    // 768-1023px - tablets
    md: {
        // marginCols: 3,
        minCols: 23,
        maxCols: 23,
        marginRows: 2,
        minRows: 8,
        maxRows: 8,
    },
    
    // 1024-1279px - laptops
    lg: {
        // marginCols: 3,
        minCols: 23,
        maxCols: 23,
        marginRows: 2,
        minRows: 8,
        maxRows: 8,
    },
    
    // 1280-1535px - desktops
    xl: {
        // marginCols: 3,
        minCols: 23,
        maxCols: 23,
        marginRows: 2,
        minRows: 10,
        maxRows: 10,
    },
    
    // >= 1536px - large desktops
    '2xl': {
        // marginCols: 3,
        minCols: 25,
        maxCols: 25,
        marginRows: 2,
        minRows: 10,
        maxRows: 10,
    },
  };
  
  function getCurrentBreakpoint(viewportWidth: number): BreakpointName {
    if (viewportWidth >= BREAKPOINTS['2xl']) return '2xl';
    if (viewportWidth >= BREAKPOINTS.xl) return 'xl';
    if (viewportWidth >= BREAKPOINTS.lg) return 'lg';
    if (viewportWidth >= BREAKPOINTS.md) return 'md';
    if (viewportWidth >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  }
  
  /**
   * Calculate terminal bounds based on grid and viewport
   * 
   * @param grid - { cols, rows }
   * @param viewportWidth - window.innerWidth
   * @returns { x, y, width, height } in grid cells
   */
  export function calculateTerminalBounds(grid: Grid, viewportWidth: number): TerminalBounds {
    const { cols, rows } = grid;
    
    if (cols === 0 || rows === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    const breakpoint = getCurrentBreakpoint(viewportWidth);
    const config = TERMINAL_CONFIG[breakpoint];
    
    // Calculate width
    let terminalCols: number;
    if (config.marginCols !== undefined) {
      // Fixed margin mode (small screens)
      terminalCols = cols - (config.marginCols * 2);
    } else {
      // Percentage mode (larger screens)
      terminalCols = Math.floor(cols * (config.widthPercent ?? 0.5));
    }
    
    // Apply width constraints
    terminalCols = Math.max(terminalCols, config.minCols);
    if (config.maxCols) terminalCols = Math.min(terminalCols, config.maxCols);
    terminalCols = Math.min(terminalCols, cols - 2); // At least 1 cell margin
    
    // Calculate height
    let terminalRows: number;
    if (config.marginRows !== undefined) {
      // Fixed margin mode (small screens)
      terminalRows = rows - (config.marginRows * 2);
    } else {
      // Percentage mode (larger screens)
      terminalRows = Math.floor(rows * (config.heightPercent ?? 0.4));
    }
    
    // Apply height constraints
    terminalRows = Math.max(terminalRows, config.minRows);
    terminalRows = Math.min(terminalRows, config.maxRows);
    terminalRows = Math.min(terminalRows, rows - 2); // At least 1 cell margin
    
    // Ensure even spacing for centering
    if ((cols - terminalCols) % 2 !== 0) terminalCols -= 1;
    if ((rows - terminalRows) % 2 !== 0) terminalRows -= 1;
    
    // Center position
    const startX = (cols - terminalCols) / 2;
    const startY = Math.floor((rows - terminalRows) / 2);
    
    return {
      x: startX,
      y: startY,
      width: terminalCols,
      height: terminalRows,
    };
  }