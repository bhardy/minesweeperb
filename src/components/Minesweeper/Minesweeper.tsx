"use client";

import { useEffect } from "react";
import classNames from "classnames";
import styles from "./minesweeper.module.css";
import { Options } from "../Options";
import { GameBoard } from "./GameBoard";
import { Timer, Count } from "./Scoreboard";
import { NewBestTime } from "../NewBestTime";
import type { GameState } from "@/types/minesweeper";
import { useStore } from "@/store";
import { useMediaQuery } from "@react-hook/media-query";
import { HappyIcon, SadIcon, SunglassesIcon } from "@/components/icons";
import { useMinesweeper } from "@/hooks/useMinesweeper";

export const Minesweeper = ({
  seed,
  onGameEnd,
  initialDifficulty,
  WinDialog,
}: {
  seed?: string;
  onGameEnd?: (gameState: GameState) => void;
  initialDifficulty?: number;
  WinDialog?: React.ComponentType<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
    time: number;
    difficulty: string;
    seed?: string;
  }>;
}) => {
  const { gameSettings, setQuickFlagMode, resetToDefaultSettings } = useStore();
  const {
    gameBoard,
    gameState,
    currentDifficulty,
    remainingMines,
    showBestTimeDialog,
    winTime,
    resetGame,
    handleDifficultyChange,
    handlePrimaryAction,
    handleSecondaryAction,
    handleTertiaryAction,
    handleBestTimeSubmit,
    setShowBestTimeDialog,
  } = useMinesweeper({
    seed,
    initialDifficulty,
    onGameEnd,
  });

  // @note: this is mostly just for development as this can only really happen
  // if the user toggles settings in dev tools
  const isTouchDevice = useMediaQuery("(pointer: coarse)");
  useEffect(() => {
    resetToDefaultSettings();
  }, [isTouchDevice, resetToDefaultSettings]);

  return (
    <div
      className={classNames(styles.minesweeper, {
        [styles.quickFlagMode]: gameSettings.quickFlagMode,
      })}
    >
      <div className={`${styles.options}`}>
        <Options
          currentDifficulty={currentDifficulty}
          setDifficulty={handleDifficultyChange}
          gameSettings={gameSettings}
          setQuickFlagMode={setQuickFlagMode}
        />
      </div>
      <div
        className={classNames(styles.jumbotron, {
          [styles.victory]: gameState.status === "won",
        })}
      >
        <Count count={remainingMines} />
        <button
          onClick={(e) => {
            resetGame();
            e.currentTarget.blur();
          }}
          className={styles.reset}
        >
          {gameState.status === "won" ? (
            <SunglassesIcon />
          ) : gameState.status === "lost" ? (
            <SadIcon />
          ) : (
            <HappyIcon />
          )}
        </button>
        <Timer startTime={gameState.startTime} endTime={gameState.endTime} />
      </div>
      <GameBoard
        gameBoard={gameBoard}
        gameState={gameState}
        onPrimaryAction={handlePrimaryAction}
        onSecondaryAction={handleSecondaryAction}
        onTertiaryAction={handleTertiaryAction}
      />
      {WinDialog ? (
        <WinDialog
          isOpen={showBestTimeDialog}
          onClose={() => setShowBestTimeDialog(false)}
          onSubmit={handleBestTimeSubmit}
          time={winTime || 0}
          difficulty={gameState.config.name}
          seed={seed}
        />
      ) : (
        <NewBestTime
          isOpen={showBestTimeDialog}
          onClose={() => setShowBestTimeDialog(false)}
          onSubmit={handleBestTimeSubmit}
          time={winTime || 0}
          difficulty={gameState.config.name}
          seed={seed}
        />
      )}
    </div>
  );
};
