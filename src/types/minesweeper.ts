export type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

export type Level = {
  name: string;
  width: number;
  height: number;
  mines: number;
};

export type GameBoard = Cell[][];

export type GameState = {
  status: "not-started" | "in-progress" | "won" | "lost";
  flaggedMines: number;
  remainingCells: number;
  startTime?: number;
  endTime?: number;
  config: Level;
};
