"use client";

import { Minesweeper } from "@/components/Minesweeper/Minesweeper";
import { DIFFICULTY_LEVELS } from "@/types/constants";
import type { GameState, AllResults, DifficultyKey } from "@/types/minesweeper";
import useLocalStorage from "use-local-storage";
import { ChallengeComplete } from "./ChallengeComplete";

export function DailyGame({
  date,
  difficulty,
}: {
  date: string;
  difficulty: string;
}) {
  const difficultyIndex = DIFFICULTY_LEVELS.findIndex(
    (level) => level.name === difficulty
  );

  const [results, setResults] = useLocalStorage<AllResults>(
    "dailyChallengeResults",
    {
      beginner: {},
      intermediate: {},
      expert: {},
    }
  );

  const handleGameEnd = (gameState: GameState) => {
    if (!gameState.startTime || !gameState.endTime) return;

    const difficultyKey = gameState.config.name as DifficultyKey;
    const difficultyResults = results?.[difficultyKey] || {};

    if (!difficultyResults[date] || difficultyResults[date].status === "lost") {
      const status =
        gameState.status === "won"
          ? difficultyResults[date]?.status === "lost"
            ? "won-retry"
            : "won"
          : "lost";

      setResults({
        ...results,
        [difficultyKey]: {
          ...difficultyResults,
          [date]: {
            status,
            time:
              gameState.status === "won"
                ? Math.floor((gameState.endTime - gameState.startTime) / 1000)
                : undefined,
          },
        },
      });
    }
  };

  return (
    <Minesweeper
      seed={date}
      onGameEnd={handleGameEnd}
      initialDifficulty={difficultyIndex}
      WinDialog={ChallengeComplete}
    />
  );
}
