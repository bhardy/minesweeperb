"use client";

import { Minesweeper } from "@/components/Minesweeper/Minesweeper";
import { format, parse } from "date-fns";
import { DIFFICULTY_LEVELS } from "@/types/constants";
import type { GameState } from "@/types/minesweeper";
import useLocalStorage from "use-local-storage";
import { useEffect, useState } from "react";

type DailyResults = {
  [key: string]: {
    status?: "won" | "lost" | "won-retry";
    time?: number;
  };
};

type DifficultyKey = "beginner" | "intermediate" | "expert";

type AllResults = {
  [key in DifficultyKey]: DailyResults;
};

export function DailyGame({
  date,
  difficulty,
}: {
  date: string;
  difficulty: string;
}) {
  const [isClient, setIsClient] = useState(false);
  const dateObj = parse(date, "MMMM-d-yy", new Date());
  const seed = format(dateObj, "yyyy-MM-dd");
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  const existingResults = results[difficulty as DifficultyKey]?.[date];

  const handleGameEnd = (gameState: GameState) => {
    if (!gameState.startTime || !gameState.endTime) return;

    const difficultyKey = gameState.config.name as DifficultyKey;
    const difficultyResults = results[difficultyKey] || {};

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
    <>
      <div className="flex flex-col items-center gap-2 p-4 min-h-[100px]">
        <h1 className="text-2xl font-bold">
          Daily Challenge: {format(dateObj, "MMMM d, yyyy")} ({difficulty})
        </h1>

        {isClient && existingResults?.status === "won" && (
          <h2 className="text-sm">
            Completed in {existingResults.time} seconds (first try)
          </h2>
        )}
        {isClient && existingResults?.status === "won-retry" && (
          <h2 className="text-sm">
            Completed in {existingResults.time} seconds (on retry)
          </h2>
        )}
      </div>

      <Minesweeper
        seed={seed}
        onGameEnd={handleGameEnd}
        initialDifficulty={difficultyIndex}
      />
    </>
  );
}
