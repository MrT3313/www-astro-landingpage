export type Node = { x: number; y: number };
export type Grid = { cols: number; rows: number };
export type Wall = [number, number];
export type PathResult = {
  path: Node[];
  searchSteps: Node[];
};
