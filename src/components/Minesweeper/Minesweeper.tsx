"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import classNames from "classnames";
import styles from "./minesweeper.module.css";
import { Options } from "../Options";
import { GameBoard } from "./GameBoard";
import { Timer, Count } from "./Scoreboard";
import { NewBestTime } from "../NewBestTime";
import type {
  GameBoard as GameBoardType,
  GameState,
} from "@/types/minesweeper";
import { DIFFICULTY_LEVELS } from "@/types/constants";
import {
  getInitialGameState,
  revealCells,
  isNewBestTime,
  saveBestTime,
} from "./game";
import useLocalStorage from "use-local-storage";

export const Minesweeper = ({
  seed,
  onGameEnd,
  initialDifficulty,
}: {
  seed?: string;
  onGameEnd?: (gameState: GameState) => void;
  initialDifficulty?: number;
}) => {
  const searchParams = useSearchParams();
  const isDebug = searchParams.has("debug");
  const [difficulty, setDifficulty] = useState<number>(initialDifficulty ?? 0);
  const [holdToFlag, setHoldToFlag] = useLocalStorage("holdToFlag", true);
  const currentConfig = DIFFICULTY_LEVELS[difficulty];

  const [gameState, setGameState] = useState<GameState>(() =>
    getInitialGameState(
      currentConfig.width,
      currentConfig.height,
      currentConfig,
      seed
    )
  );

  const [gameBoard, setGameBoard] = useState<GameBoardType>(() =>
    Array.from({ length: currentConfig.height }, () =>
      Array.from({ length: currentConfig.width }, () => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      }))
    )
  );

  const [showBestTimeDialog, setShowBestTimeDialog] = useState(false);
  const [winTime, setWinTime] = useState<number | null>(null);

  const resetGame = useCallback(() => {
    setGameBoard(
      Array.from({ length: currentConfig.height }, () =>
        Array.from({ length: currentConfig.width }, () => ({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        }))
      )
    );
    setGameState(
      getInitialGameState(
        currentConfig.width,
        currentConfig.height,
        currentConfig,
        seed
      )
    );
    setShowBestTimeDialog(false);
    setWinTime(null);
  }, [currentConfig, seed]);

  const handlePrimaryAction = (x: number, y: number) => {
    if (gameState.status === "won") return;
    if (gameBoard[y][x].isFlagged) return;
    const { gameBoard: nextGameBoard, gameState: nextGameState } = revealCells(
      { x, y },
      gameBoard,
      gameState
    );

    setGameBoard(nextGameBoard);
    setGameState(nextGameState);
  };

  const handleSecondaryAction = (x: number, y: number) => {
    if (gameState.status === "won") return;
    if (gameBoard[y][x].isRevealed) return; // Can't flag revealed cells

    const newBoard = gameBoard.map((row, rowIndex) =>
      row.map((cell, colIndex) =>
        rowIndex === y && colIndex === x
          ? { ...cell, isFlagged: !cell.isFlagged }
          : cell
      )
    );

    const newFlagCount = newBoard.reduce(
      (count, row) =>
        count +
        row.reduce((rowCount, cell) => rowCount + (cell.isFlagged ? 1 : 0), 0),
      0
    );

    setGameBoard(newBoard);
    setGameState((prevState) => ({
      ...prevState,
      flaggedMines: newFlagCount,
    }));
  };

  const handleGameWin = useCallback(
    (time: number) => {
      const difficulty = currentConfig.name;
      if (isNewBestTime(difficulty, time)) {
        setWinTime(time);
        setShowBestTimeDialog(true);
      }
      if (seed) {
        setWinTime(time);
        setShowBestTimeDialog(true);
      }
    },
    [currentConfig.name, seed]
  );

  useEffect(() => {
    if (
      gameState.status === "won" &&
      gameState.endTime &&
      gameState.startTime
    ) {
      const time = Math.floor((gameState.endTime - gameState.startTime) / 1000);
      handleGameWin(time);
    }
  }, [handleGameWin, gameState.status, gameState.endTime, gameState.startTime]);

  const handleBestTimeSubmit = (name: string) => {
    if (winTime !== null) {
      saveBestTime(currentConfig.name, name, winTime);
      setShowBestTimeDialog(false);
      setWinTime(null);
    }
  };

  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);

  useEffect(() => {
    if (gameState.status === "won" || gameState.status === "lost") {
      onGameEnd?.(gameState);
    }
  }, [gameState, onGameEnd]);

  return (
    <div className={styles.minesweeper}>
      <div className={`${styles.menu} ${styles.options}`}>
        <Options
          difficultyLevels={DIFFICULTY_LEVELS}
          currentDifficulty={difficulty}
          setDifficulty={setDifficulty}
          holdToFlag={holdToFlag}
          onHoldToFlagChange={setHoldToFlag}
        />
      </div>
      <div
        className={classNames(styles.menu, {
          [styles.victory]: gameState.status === "won",
        })}
      >
        <Count count={currentConfig.mines - gameState.flaggedMines} />
        <button
          onClick={(e) => {
            resetGame();
            e.currentTarget.blur();
          }}
          className={styles.reset}
        >
          {gameState.status === "won"
            ? "😎"
            : gameState.status === "lost"
            ? "😔"
            : "🙂"}
        </button>
        <Timer startTime={gameState.startTime} endTime={gameState.endTime} />
      </div>
      <GameBoard
        gameBoard={gameBoard}
        gameState={gameState}
        onPrimaryAction={handlePrimaryAction}
        onSecondaryAction={handleSecondaryAction}
        holdToFlag={holdToFlag}
      />
      {isDebug && (
        <pre
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            color: "black",
          }}
        >
          {JSON.stringify(gameState, null, 2)}
        </pre>
      )}
      <NewBestTime
        isOpen={showBestTimeDialog}
        onClose={() => setShowBestTimeDialog(false)}
        onSubmit={handleBestTimeSubmit}
        time={winTime || 0}
        difficulty={currentConfig.name}
        seed={seed}
      />
    </div>
  );
};
