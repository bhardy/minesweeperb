import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DifficultyKey = "beginner" | "intermediate" | "expert";

export interface GameResult {
  status: "won" | "lost" | "won-retry";
  time?: number;
}

export interface BestTime {
  name: string;
  time: number;
}

export interface BestTimes {
  [difficulty: string]: BestTime | null;
}

interface AppState {
  // Daily Challenge Results
  dailyChallengeResults: Record<DifficultyKey, Record<string, GameResult>>;
  setDailyChallengeResults: (
    results: Record<DifficultyKey, Record<string, GameResult>>
  ) => void;

  // Latest Username
  latestUsername: string;
  setLatestUsername: (name: string) => void;

  // Game Settings
  holdToFlag: boolean;
  setHoldToFlag: (value: boolean) => void;

  // Best Times
  bestTimes: BestTimes;
  setBestTimes: (times: BestTimes) => void;
  addBestTime: (difficulty: string, name: string, time: number) => void;
  getBestTime: (difficulty: string) => BestTime | null;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Daily Challenge Results
      dailyChallengeResults: {
        beginner: {},
        intermediate: {},
        expert: {},
      },
      setDailyChallengeResults: (results) =>
        set({ dailyChallengeResults: results }),

      // Latest Username
      latestUsername: "",
      setLatestUsername: (name) => set({ latestUsername: name }),

      // Game Settings
      holdToFlag: true,
      setHoldToFlag: (value) => set({ holdToFlag: value }),

      // Best Times
      bestTimes: {},
      setBestTimes: (times) => set({ bestTimes: times }),
      addBestTime: (difficulty: string, name: string, time: number) => {
        const currentBest = get().bestTimes[difficulty];

        // Only update if there's no current best time or if the new time is better
        if (!currentBest || time < currentBest.time) {
          set((state) => ({
            bestTimes: {
              ...state.bestTimes,
              [difficulty]: { name, time },
            },
          }));
        }
      },
      getBestTime: (difficulty: string) => {
        return get().bestTimes[difficulty] || null;
      },
    }),
    {
      name: "minesweeper-storage",
      partialize: (state) => ({
        dailyChallengeResults: state.dailyChallengeResults,
        latestUsername: state.latestUsername,
        holdToFlag: state.holdToFlag,
        bestTimes: state.bestTimes,
      }),
    }
  )
);
