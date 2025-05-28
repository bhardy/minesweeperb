"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useReducer,
  useMemo,
} from "react";
import classNames from "classnames";
import styles from "./minesweeper.module.css";
import { Options } from "../Options";
import { GameBoard } from "./GameBoard";
import { Timer, Count } from "./Scoreboard";
import { NewBestTime } from "../NewBestTime";
import type {
  GameBoard as GameBoardType,
  GameState,
  Level,
} from "@/types/minesweeper";
import { DIFFICULTY_LEVELS } from "@/types/constants";
import {
  getInitialGameState,
  revealCells,
  isNewBestTime,
  saveBestTime,
  chordClick,
} from "./game";
import { HappyIcon, SadIcon, SunglassesIcon } from "@/components/icons";
import { useStore } from "@/store";
import { useMediaQuery } from "@react-hook/media-query";

type GameAction =
  | { type: "REVEAL_CELL"; payload: { x: number; y: number } }
  | { type: "TOGGLE_FLAG"; payload: { x: number; y: number } }
  | { type: "CHORD_CLICK"; payload: { x: number; y: number } }
  | { type: "RESET_GAME" }
  | { type: "CHANGE_DIFFICULTY"; payload: { config: Level } };

function gameReducer(
  state: { gameBoard: GameBoardType; gameState: GameState },
  action: GameAction
): { gameBoard: GameBoardType; gameState: GameState } {
  const isGameOver =
    state.gameState.status === "won" || state.gameState.status === "lost";
  switch (action.type) {
    case "REVEAL_CELL": {
      const { x, y } = action.payload;
      if (isGameOver) return state;
      if (state.gameBoard[y][x].isFlagged) return state;
      return revealCells({ x, y }, state.gameBoard, state.gameState);
    }
    case "TOGGLE_FLAG": {
      const { x, y } = action.payload;
      if (isGameOver) return state;
      if (state.gameBoard[y][x].isRevealed) return state;

      const newBoard = state.gameBoard.map((row, rowIndex) =>
        row.map((cell, colIndex) =>
          rowIndex === y && colIndex === x
            ? { ...cell, isFlagged: !cell.isFlagged }
            : cell
        )
      );

      const newFlagCount = newBoard.reduce(
        (count, row) =>
          count +
          row.reduce(
            (rowCount, cell) => rowCount + (cell.isFlagged ? 1 : 0),
            0
          ),
        0
      );

      return {
        gameBoard: newBoard,
        gameState: {
          ...state.gameState,
          flaggedMines: newFlagCount,
        },
      };
    }
    case "CHORD_CLICK": {
      const { x, y } = action.payload;
      if (!state.gameBoard[y][x].isRevealed) return state;
      return chordClick({ x, y }, state.gameBoard, state.gameState);
    }
    case "RESET_GAME": {
      const initialGameState = getInitialGameState(
        state.gameState.config.width,
        state.gameState.config.height,
        state.gameState.config,
        state.gameState.seed
      );
      const initialGameBoard = Array.from(
        { length: state.gameState.config.height },
        () =>
          Array.from({ length: state.gameState.config.width }, () => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          }))
      );
      return {
        gameBoard: initialGameBoard,
        gameState: initialGameState,
      };
    }
    case "CHANGE_DIFFICULTY": {
      const { config } = action.payload;
      const initialGameState = getInitialGameState(
        config.width,
        config.height,
        config,
        state.gameState.seed
      );
      const initialGameBoard = Array.from({ length: config.height }, () =>
        Array.from({ length: config.width }, () => ({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        }))
      );
      return {
        gameBoard: initialGameBoard,
        gameState: initialGameState,
      };
    }
  }
}

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

  const initialConfig = DIFFICULTY_LEVELS[initialDifficulty ?? 0];
  const [{ gameBoard, gameState }, dispatch] = useReducer(gameReducer, {
    gameBoard: Array.from({ length: initialConfig.height }, () =>
      Array.from({ length: initialConfig.width }, () => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      }))
    ),
    gameState: getInitialGameState(
      initialConfig.width,
      initialConfig.height,
      initialConfig,
      seed
    ),
  });

  const memoizedGameBoard = useMemo(() => gameBoard, [gameBoard]);

  const currentConfig = gameState.config;
  const currentDifficulty = DIFFICULTY_LEVELS.findIndex(
    (level) =>
      level.width === currentConfig.width &&
      level.height === currentConfig.height &&
      level.mines === currentConfig.mines
  );

  const [showBestTimeDialog, setShowBestTimeDialog] = useState(false);
  const [winTime, setWinTime] = useState<number | null>(null);

  const prevGameStateRef = useRef<GameState | undefined>(undefined);

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
    setShowBestTimeDialog(false);
    setWinTime(null);
  }, []);

  const handleDifficultyChange = useCallback((newDifficulty: number) => {
    dispatch({
      type: "CHANGE_DIFFICULTY",
      payload: {
        config: DIFFICULTY_LEVELS[newDifficulty],
      },
    });
  }, []);

  const handlePrimaryAction = useCallback(
    (x: number, y: number) => {
      dispatch({ type: "REVEAL_CELL", payload: { x, y } });
    },
    [dispatch]
  );

  const handleSecondaryAction = useCallback(
    (x: number, y: number) => {
      dispatch({ type: "TOGGLE_FLAG", payload: { x, y } });
    },
    [dispatch]
  );

  const handleTertiaryAction = useCallback(
    (x: number, y: number) => {
      dispatch({ type: "CHORD_CLICK", payload: { x, y } });
    },
    [dispatch]
  );

  const handleGameWin = useCallback(
    (time: number) => {
      if (isNewBestTime(currentConfig.name, time)) {
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
    if (
      (gameState.status === "won" || gameState.status === "lost") &&
      prevGameStateRef.current?.status !== gameState.status
    ) {
      onGameEnd?.(gameState);
    }
    prevGameStateRef.current = gameState;
  }, [gameState, onGameEnd]);

  // @note: this is mostly just for development as this can only really happen if the user toggles settings in dev tools
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
        <Count count={currentConfig.mines - gameState.flaggedMines} />
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
        gameBoard={memoizedGameBoard}
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
          difficulty={currentConfig.name}
          seed={seed}
        />
      ) : (
        <NewBestTime
          isOpen={showBestTimeDialog}
          onClose={() => setShowBestTimeDialog(false)}
          onSubmit={handleBestTimeSubmit}
          time={winTime || 0}
          difficulty={currentConfig.name}
          seed={seed}
        />
      )}
    </div>
  );
};
