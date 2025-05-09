export interface Level {
  name: string;
  width: number;
  height: number;
  mines: number;
}

export interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

export type GameBoard = Cell[][];

export interface GameState {
  status: "not-started" | "in-progress" | "won" | "lost";
  flaggedMines: number;
  remainingCells: number;
  lastClick?: { x: number; y: number };
  startTime?: number;
  endTime?: number;
  config: Level;
  seed?: string;
}

export interface BestTime {
  name: string;
  time: number;
  date: string;
}
