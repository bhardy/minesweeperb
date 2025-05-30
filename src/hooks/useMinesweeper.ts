import {
  useReducer,
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
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
} from "@/lib/game";

type GameAction =
  | { type: "REVEAL_CELL"; payload: { x: number; y: number } }
  | { type: "TOGGLE_FLAG"; payload: { x: number; y: number } }
  | { type: "CHORD_CLICK"; payload: { x: number; y: number } }
  | { type: "RESET_GAME" }
  | { type: "CHANGE_DIFFICULTY"; payload: { config: Level } };

function getInitialState(
  initialBoard: GameBoardType | undefined,
  initialConfig: Level,
  seed?: string
) {
  if (initialBoard) {
    const flaggedMines = initialBoard.reduce(
      (count, row) =>
        count +
        row.reduce((rowCount, cell) => rowCount + (cell.isFlagged ? 1 : 0), 0),
      0
    );
    const remainingCells = initialBoard.reduce(
      (count, row) =>
        count +
        row.reduce(
          (rowCount, cell) => rowCount + (!cell.isRevealed ? 1 : 0),
          0
        ),
      0
    );
    const hasRevealedCells = initialBoard.some((row) =>
      row.some((cell) => cell.isRevealed)
    );

    return {
      gameBoard: initialBoard,
      gameState: {
        status: hasRevealedCells
          ? ("in-progress" as const)
          : ("not-started" as const),
        flaggedMines,
        remainingCells,
        config: {
          name: "tutorial",
          width: initialBoard[0].length,
          height: initialBoard.length,
          mines: initialBoard.reduce(
            (count, row) =>
              count +
              row.reduce(
                (rowCount, cell) => rowCount + (cell.isMine ? 1 : 0),
                0
              ),
            0
          ),
        },
        startTime: hasRevealedCells ? Date.now() : undefined,
      },
      initialBoard,
    };
  }

  return {
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
  };
}

function gameReducer(
  state: {
    gameBoard: GameBoardType;
    gameState: GameState;
    initialBoard?: GameBoardType;
  },
  action: GameAction
): {
  gameBoard: GameBoardType;
  gameState: GameState;
  initialBoard?: GameBoardType;
} {
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
        ...state,
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
      const initialState = getInitialState(
        state.initialBoard,
        state.gameState.config,
        state.gameState.seed
      );
      return {
        ...state,
        ...initialState,
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
        ...state,
        gameBoard: initialGameBoard,
        gameState: initialGameState,
      };
    }
  }
}

interface UseMinesweeperProps {
  seed?: string;
  initialDifficulty?: number;
  onGameEnd?: (gameState: GameState) => void;
  initialBoard?: GameBoardType;
}

export function useMinesweeper({
  seed,
  initialDifficulty = 0,
  onGameEnd,
  initialBoard,
}: UseMinesweeperProps) {
  const initialConfig = DIFFICULTY_LEVELS[initialDifficulty];

  const [{ gameBoard, gameState }, dispatch] = useReducer(
    gameReducer,
    getInitialState(initialBoard, initialConfig, seed)
  );

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

  const handleDifficultyChange = useCallback((difficulty: number) => {
    dispatch({
      type: "CHANGE_DIFFICULTY",
      payload: { config: DIFFICULTY_LEVELS[difficulty] },
    });
  }, []);

  const handlePrimaryAction = useCallback((x: number, y: number) => {
    dispatch({ type: "REVEAL_CELL", payload: { x, y } });
  }, []);

  const handleSecondaryAction = useCallback((x: number, y: number) => {
    dispatch({ type: "TOGGLE_FLAG", payload: { x, y } });
  }, []);

  const handleTertiaryAction = useCallback((x: number, y: number) => {
    dispatch({ type: "CHORD_CLICK", payload: { x, y } });
  }, []);

  const handleBestTimeSubmit = useCallback(
    (name: string) => {
      if (winTime) {
        saveBestTime(gameState.config.name, name, winTime);
      }
      setShowBestTimeDialog(false);
    },
    [gameState.config.name, winTime]
  );

  useEffect(() => {
    if (gameState.status === "won" && !showBestTimeDialog) {
      const time = gameState.endTime
        ? Math.floor((gameState.endTime - (gameState.startTime || 0)) / 1000)
        : 0;
      if (isNewBestTime(gameState.config.name, time)) {
        setWinTime(time);
        setShowBestTimeDialog(true);
      }
    }
  }, [
    gameState.status,
    gameState.config.name,
    gameState.endTime,
    gameState.startTime,
    showBestTimeDialog,
  ]);

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
    handleBestTimeSubmit,
    setShowBestTimeDialog,
  };
}
