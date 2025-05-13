"use client";

import { useEffect, useState } from "react";
import { Minesweeper } from "@/components/Minesweeper/Minesweeper";
import { format, parse } from "date-fns";
import { DIFFICULTY_LEVELS } from "@/types/constants";
import type { GameState, AllResults, DifficultyKey } from "@/types/minesweeper";
import useLocalStorage from "use-local-storage";
import { ChallengeComplete } from "./ChallengeComplete";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DayResult } from "./DayResult";

export function DailyGame({
  date,
  difficulty,
}: {
  date: string;
  difficulty: string;
}) {
  const [isClient, setIsClient] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const dateObj = parse(date, "MMMM-d-yy", new Date());
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

        {isClient && existingResults?.status && (
          <Button variant="outline" onClick={() => setShowResults(true)}>
            View Results
          </Button>
        )}
      </div>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>{format(dateObj, "MMMM d, yyyy")}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="sr-only">
            Results for {format(dateObj, "MMMM d, yyyy")}
          </DialogDescription>
          <DayResult results={results} date={date} />
        </DialogContent>
      </Dialog>

      <Minesweeper
        seed={date}
        onGameEnd={handleGameEnd}
        initialDifficulty={difficultyIndex}
        WinDialog={ChallengeComplete}
      />
    </>
  );
}
