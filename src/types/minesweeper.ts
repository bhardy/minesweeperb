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

export type DailyResults = {
  [key: string]: {
    status?: "won" | "lost" | "won-retry";
    time?: number;
  };
};

export type AllResults = {
  beginner: DailyResults;
  intermediate: DailyResults;
  expert: DailyResults;
};

export type DifficultyKey = keyof AllResults;
