import type { Node } from '../../types/index';

export function getNeighbors(
  node: Node,
  cols: number,
  rows: number,
  walls: Set<string>
): Node[] {
  const neighbors: Node[] = [];
  const directions: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  
  for (const [dx, dy] of directions) {
    const x = node.x + dx;
    const y = node.y + dy;
    if (x >= 0 && x < cols && y >= 0 && y < rows && !walls.has(`${x},${y}`)) {
      neighbors.push({ x, y });
    }
  }
  return neighbors;
}
