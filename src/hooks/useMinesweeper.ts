import {
  useReducer,
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
import type {
  GameBoard,
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
} from "@/lib/game";

type GameAction =
  | { type: "REVEAL_CELL"; payload: { x: number; y: number } }
  | { type: "TOGGLE_FLAG"; payload: { x: number; y: number } }
  | { type: "CHORD_CLICK"; payload: { x: number; y: number } }
  | { type: "RESET_GAME" }
  | { type: "CHANGE_DIFFICULTY"; payload: { config: Level } };

export function gameReducer(
  state: { gameBoard: GameBoardType; gameState: GameState },
  action: GameAction
): { gameBoard: GameBoardType; gameState: GameState } {
  const isGameOver =
    state.gameState.status === "won" || state.gameState.status === "lost";
  let result;
  switch (action.type) {
    case "REVEAL_CELL": {
      const { x, y } = action.payload;
      if (isGameOver) return state;
      if (state.gameBoard[y][x].isFlagged) return state;
      result = revealCells({ x, y }, state.gameBoard, state.gameState);
      break;
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

      result = {
        gameBoard: newBoard,
        gameState: {
          ...state.gameState,
          flaggedMines: newFlagCount,
          initialBoard: state.gameState.initialBoard,
        },
      };
      break;
    }
    case "CHORD_CLICK": {
      const { x, y } = action.payload;
      if (!state.gameBoard[y][x].isRevealed) return state;
      result = chordClick({ x, y }, state.gameBoard, state.gameState);
      break;
    }
    case "RESET_GAME": {
      const initialGameState = getInitialGameState(
        state.gameState.config.width,
        state.gameState.config.height,
        state.gameState.config,
        state.gameState.seed,
        state.gameState.initialBoard
      );
      const initialGameBoard =
        state.gameState.initialBoard ||
        Array.from({ length: state.gameState.config.height }, () =>
          Array.from({ length: state.gameState.config.width }, () => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          }))
        );
      result = {
        gameBoard: initialGameBoard,
        gameState: initialGameState,
      };
      break;
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
      result = {
        gameBoard: initialGameBoard,
        gameState: initialGameState,
      };
      break;
    }
    default:
      result = state;
  }

  // Always preserve initialBoard in gameState
  return {
    ...result,
    gameState: {
      ...result.gameState,
      initialBoard: state.gameState.initialBoard,
    },
  };
}

interface UseMinesweeperProps {
  seed?: string;
  initialDifficulty?: number;
  onGameEnd?: (gameState: GameState) => void;
  initialBoard?: GameBoard;
}

export function useMinesweeper({
  seed,
  initialDifficulty = 0,
  onGameEnd,
  initialBoard,
}: UseMinesweeperProps) {
  // Create config based on initial board if provided, otherwise use difficulty level
  const initialConfig = initialBoard
    ? {
        name: "custom",
        width: initialBoard[0].length,
        height: initialBoard.length,
        mines: initialBoard.reduce(
          (count, row) =>
            count +
            row.reduce((rowCount, cell) => rowCount + (cell.isMine ? 1 : 0), 0),
          0
        ),
      }
    : DIFFICULTY_LEVELS[initialDifficulty];

  const [{ gameBoard, gameState }, dispatch] = useReducer(gameReducer, {
    gameBoard: initialBoard
      ? initialBoard.map((row) => row.map((cell) => ({ ...cell })))
      : Array.from({ length: initialConfig.height }, () =>
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
      seed,
      initialBoard
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

  const remainingMines = useMemo(
    () => currentConfig.mines - gameState.flaggedMines,
    [currentConfig.mines, gameState.flaggedMines]
  );

  const [showBestTimeDialog, setShowBestTimeDialog] = useState(false);
  const [winTime, setWinTime] = useState<number | null>(null);

  const prevGameStateRef = useRef<GameState | undefined>(undefined);

  useEffect(() => {
    if (
      (gameState.status === "won" || gameState.status === "lost") &&
      prevGameStateRef.current?.status !== gameState.status
    ) {
      onGameEnd?.(gameState);
    }
    prevGameStateRef.current = gameState;
  }, [gameState, onGameEnd]);

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

  const handleBestTimeSubmit = useCallback(
    (name: string) => {
      if (winTime !== null) {
        saveBestTime(currentConfig.name, name, winTime);
        setShowBestTimeDialog(false);
        setWinTime(null);
      }
    },
    [currentConfig.name, winTime]
  );

  return {
    gameBoard: memoizedGameBoard,
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
    handleGameWin,
    handleBestTimeSubmit,
    setShowBestTimeDialog,
  };
}
