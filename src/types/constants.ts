import type { Level } from "./minesweeper";

export const BEST_TIMES_KEY = "bestTimes" as const;
export const LATEST_USERNAME_KEY = "latestUsername" as const;

export const DIFFICULTY_LEVELS: Level[] = [
  {
    name: "beginner",
    width: 9,
    height: 9,
    mines: 10,
  },
  {
    name: "intermediate",
    width: 16,
    height: 16,
    mines: 40,
  },
  {
    name: "expert",
    width: 30,
    height: 16,
    mines: 99,
  },
];

export const GAME_MODES = [
  {
    name: "Classic",
    value: "classic",
  },
  {
    name: "Daily Challenge",
    value: "daily",
  },
];
