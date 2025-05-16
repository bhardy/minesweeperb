"use client";

import { Minesweeper } from "@/components/Minesweeper/Minesweeper";
import { DIFFICULTY_LEVELS } from "@/types/constants";
import type { GameState, DifficultyKey } from "@/types/minesweeper";
import { useStore } from "@/store";
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

  const {
    dailyChallengeResults: results,
    setDailyChallengeResults: setResults,
  } = useStore();

  const handleGameEnd = (gameState: GameState) => {
    if (!gameState.startTime || !gameState.endTime) return;

    const difficultyKey = gameState.config.name as DifficultyKey;
    const difficultyResults = results?.[difficultyKey] || {};
    const existingResult = difficultyResults[date];

    // Only proceed if the game was won
    if (gameState.status === "won") {
      const newTime = Math.floor(
        (gameState.endTime - gameState.startTime) / 1000
      );

      // Determine the new status

      let newStatus;
      let shouldUpdateTime = false;

      // If there was no existing status, use the raw status from gameState
      if (!existingResult?.status) {
        newStatus = gameState.status;

        if (gameState.status === "won") {
          shouldUpdateTime = true;
        }
      }

      // If the existing status was lost, use won-retry
      if (existingResult?.status === "lost") {
        newStatus = "won-retry";
        shouldUpdateTime = true;
      }

      // Right now we don't let users improve their time if they had a clean first win
      if (existingResult?.status === "won") {
        newStatus = "won";
        shouldUpdateTime = false;
      }

      // If the existing status was won, user can improve time
      if (existingResult?.status === "won-retry") {
        newStatus = "won-retry";
        shouldUpdateTime = true;
      }

      if (shouldUpdateTime) {
        setResults({
          ...results,
          [difficultyKey]: {
            ...difficultyResults,
            [date]: {
              status: newStatus,
              time: newTime,
            },
          },
        });
      }
    } else if (!existingResult) {
      // Handle loss only if there's no existing result
      setResults({
        ...results,
        [difficultyKey]: {
          ...difficultyResults,
          [date]: {
            status: "lost",
            time: undefined,
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
