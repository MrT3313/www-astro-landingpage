export type Node = { x: number; y: number };
export type Grid = { cols: number; rows: number };
export type Wall = [number, number];
export type PathResult = {
  path: Node[];
  searchSteps: Node[];
};

export class AStarSearch {
  private grid: Grid;
  private walls: Set<string>;
  private searchSteps: Node[];

  constructor(grid: Grid, walls: Wall[]) {
    this.grid = grid;
    this.walls = new Set(walls.map(([x, y]) => `${x},${y}`));
    this.searchSteps = [];
  }

  private heuristic(a: Node, b: Node): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private getNeighbors(node: Node, cols: number, rows: number): Node[] {
    const neighbors: Node[] = [];
    const directions: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    
    for (const [dx, dy] of directions) {
      const x = node.x + dx;
      const y = node.y + dy;
      if (x >= 0 && x < cols && y >= 0 && y < rows && !this.walls.has(`${x},${y}`)) {
        neighbors.push({ x, y });
      }
    }
    return neighbors;
  }

  findPath(start: Node, end: Node, cols: number, rows: number): PathResult {
    const openSet: Node[] = [start];
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, Node>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    const key = (node: Node): string => `${node.x},${node.y}`;
    
    gScore.set(key(start), 0);
    fScore.set(key(start), this.heuristic(start, end));

    while (openSet.length > 0) {
      openSet.sort((a, b) => (fScore.get(key(a)) ?? Infinity) - (fScore.get(key(b)) ?? Infinity));
      const current = openSet.shift()!;
      
      closedSet.add(key(current));
      this.searchSteps.push({ x: current.x, y: current.y });

      if (current.x === end.x && current.y === end.y) {
        const path: Node[] = [];
        let temp: Node = current;
        while (cameFrom.has(key(temp))) {
          path.unshift(temp);
          temp = cameFrom.get(key(temp))!;
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
