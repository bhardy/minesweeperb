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

export type CellAction = "reveal" | "flag" | "none" | "quick-reveal";

export interface CellSettings {
  leftClick: CellAction;
  rightClick: CellAction;
  leftRightClick: CellAction;
  hold: CellAction;
}

export interface GameSettings {
  controlMode: "basic" | "custom";
  quickFlagMode: boolean;
  unrevealedCells: CellSettings;
  revealedCells: CellSettings;
}

const getDefaultTouchSettings = (): GameSettings => ({
  controlMode: "basic",
  quickFlagMode: false,
  unrevealedCells: {
    leftClick: "reveal",
    rightClick: "none",
    leftRightClick: "none",
    hold: "flag",
  },
  revealedCells: {
    leftClick: "quick-reveal",
    rightClick: "none",
    leftRightClick: "none",
    hold: "none",
  },
});

const getDefaultMouseSettings = (): GameSettings => ({
  controlMode: "basic",
  quickFlagMode: false,
  unrevealedCells: {
    leftClick: "reveal",
    rightClick: "flag",
    leftRightClick: "none",
    hold: "none",
  },
  revealedCells: {
    leftClick: "quick-reveal",
    rightClick: "none",
    leftRightClick: "none",
    hold: "none",
  },
});

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
  gameSettings: GameSettings;
  setGameSettings: (settings: GameSettings) => void;
  updateUnrevealedCellSetting: (
    action: keyof CellSettings,
    value: CellAction
  ) => void;
  updateRevealedCellSetting: (
    action: keyof CellSettings,
    value: CellAction
  ) => void;
  setControlMode: (mode: "basic" | "custom") => void;
  setQuickFlagMode: (enabled: boolean) => void;
  resetToDefaultSettings: () => void;

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
      gameSettings: getDefaultMouseSettings(),
      setGameSettings: (settings) => set({ gameSettings: settings }),
      updateUnrevealedCellSetting: (action, value) =>
        set((state) => ({
          gameSettings: {
            ...state.gameSettings,
            unrevealedCells: {
              ...state.gameSettings.unrevealedCells,
              [action]: value,
            },
          },
        })),
      updateRevealedCellSetting: (action, value) =>
        set((state) => ({
          gameSettings: {
            ...state.gameSettings,
            revealedCells: {
              ...state.gameSettings.revealedCells,
              [action]: value,
            },
          },
        })),
      setControlMode: (mode) =>
        set((state) => ({
          gameSettings: {
            ...state.gameSettings,
            controlMode: mode,
            quickFlagMode:
              mode === "custom" ? false : state.gameSettings.quickFlagMode,
          },
        })),
      setQuickFlagMode: (enabled) =>
        set((state) => ({
          gameSettings: {
            ...state.gameSettings,
            quickFlagMode: enabled,
          },
        })),
      resetToDefaultSettings: () => {
        const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
        set({
          gameSettings: isTouchDevice
            ? getDefaultTouchSettings()
            : getDefaultMouseSettings(),
        });
      },

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
        gameSettings: state.gameSettings,
        bestTimes: state.bestTimes,
      }),
    }
  )
);
