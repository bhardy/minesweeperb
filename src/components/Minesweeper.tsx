"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import classNames from "classnames";
import styles from "./minesweeper.module.css";
import { Options } from "./Options";
import type {
  Level as LevelType,
  GameBoard as GameBoardType,
  GameState as GameStateType,
  Cell as CellType,
} from "../types/minesweeper";
import { usePressHandler } from "../hooks/usePressHandler";
import { NewBestTime } from "./NewBestTime";
import { BEST_TIMES_KEY } from "../types/constants";

export const DIFFICULTY_LEVELS: LevelType[] = [
  {
    name: "beginner",
    width: 9,
    height: 9,
    mines: 10,
  },
  {
    name: "intermediate",
    width: 16,
    height: 16,
    mines: 40,
  },
  {
    name: "expert",
    width: 30,
    height: 16,
    mines: 99,
  },
];

const getInitialGameState = (
  width: number,
  height: number,
  config: LevelType
): GameStateType => ({
  status: "not-started",
  flaggedMines: 0,
  remainingCells: width * height,
  startTime: undefined,
  endTime: undefined,
  config,
});

const fillMines = (
  initialClick: { x: number; y: number },
  gameBoard: GameBoardType,
  difficulty: LevelType
) => {
  const { x, y } = initialClick;
  const { width, height, mines } = difficulty;

  // Create a list of all possible positions
  const allCells: { x: number; y: number }[] = [];
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      allCells.push({ x: j, y: i });
    }
  }

  // Remove the initial click position and its adjacent cells
  const safeCells = new Set<string>();

  // Add all 8 adjacent positions
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const adjX = x + dx;
      const adjY = y + dy;
      // Skip positions outside the board
      if (adjX >= 0 && adjX < width && adjY >= 0 && adjY < height) {
        safeCells.add(`${adjX},${adjY}`);
      }
    }
  }

  const availablePositions = allCells.filter(
    (pos) => !safeCells.has(`${pos.x},${pos.y}`)
  );

  // Randomly select positions for mines
  const minePositions = new Set<string>();
  while (minePositions.size < mines && availablePositions.length > 0) {
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const position = availablePositions[randomIndex];
    minePositions.add(`${position.x},${position.y}`);
    availablePositions.splice(randomIndex, 1);
  }

  // Create a new board with mines
  const boardWithMines = gameBoard.map((row, rowIndex) =>
    row.map((cell, colIndex) => ({
      ...cell,
      isMine: minePositions.has(`${colIndex},${rowIndex}`),
    }))
  );

  // Only update adjacent cells of mine positions
  const boardWithAdjacentMines = boardWithMines.map((row) => [...row]);

  minePositions.forEach((minePos) => {
    const [mineX, mineY] = minePos.split(",").map(Number);

    // Check all 8 surrounding cells
    // @todo: this could be further optimized by tracking which cells have already been checked
    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        const cellX = mineX + x;
        const cellY = mineY + y;

        // Skip the mine cell itself and check bounds
        if (
          (x === 0 && y === 0) ||
          cellX < 0 ||
          cellX >= width ||
          cellY < 0 ||
          cellY >= height
        ) {
          continue;
        }

        // Increment adjacent mines count for this cell
        if (!boardWithAdjacentMines[cellY][cellX].isMine) {
          boardWithAdjacentMines[cellY][cellX].adjacentMines++;
        }
      }
    }
  });

  return boardWithAdjacentMines;
};

const revealCells = (
  cell: { x: number; y: number },
  gameBoard: GameBoardType,
  gameState: GameStateType
): {
  gameBoard: GameBoardType;
  gameState: GameStateType;
} => {
  const { x, y } = cell;
  const width = gameBoard[0].length;
  const height = gameBoard.length;

  if (gameState.status === "not-started") {
    const initialBoard = fillMines(cell, gameBoard, gameState.config);
    const startGameState = {
      ...gameState,
      status: "in-progress" as const,
      startTime: Date.now(),
    };
    return revealCells(cell, initialBoard, startGameState);
  }

  if (gameBoard[y][x].isMine) {
    // Reveal all cells if user clicked a mine
    const revealedBoard = gameBoard.map((row) =>
      row.map((cell) => ({ ...cell, isRevealed: true }))
    );
    return {
      gameBoard: revealedBoard,
      gameState: {
        ...gameState,
        status: "lost",
        flaggedMines: 0,
        remainingCells: 0,
        endTime: Date.now(),
      },
    };
  }

  // Skip if cell is already revealed
  if (gameBoard[y][x].isRevealed) {
    return {
      gameBoard: gameBoard,
      gameState: gameState,
    };
  }

  // Skip if cell is flagged - @note: this only matters if the user flagged a safe cell
  if (gameBoard[y][x].isFlagged) {
    return {
      gameBoard: gameBoard,
      gameState: gameState,
    };
  }

  // Reveal the current cell
  let newBoard = gameBoard.map((row, rowIndex) =>
    row.map((cell, colIndex) =>
      rowIndex === y && colIndex === x ? { ...cell, isRevealed: true } : cell
    )
  );

  // If cell has no adjacent mines, reveal adjacent cells
  if (newBoard[y][x].adjacentMines === 0) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const newX = x + dx;
        const newY = y + dy;

        // Skip current cell and check bounds
        if (
          (dx === 0 && dy === 0) ||
          newX < 0 ||
          newX >= width ||
          newY < 0 ||
          newY >= height
        ) {
          continue;
        }

        // Skip mines and already revealed cells
        if (!newBoard[newY][newX].isMine && !newBoard[newY][newX].isRevealed) {
          const result = revealCells({ x: newX, y: newY }, newBoard, gameState);
          newBoard = result.gameBoard;
        }
      }
    }
  }

  // Check if all non-mine cells are revealed
  const allRevealed = newBoard.every((row) =>
    row.every((cell) => cell.isRevealed || cell.isMine)
  );

  if (allRevealed) {
    return {
      gameBoard: newBoard,
      gameState: {
        ...gameState,
        status: "won",
        remainingCells: 0,
        endTime: Date.now(),
      },
    };
  }

  return {
    gameBoard: newBoard,
    gameState: gameState,
  };
};

interface BestTime {
  name: string;
  time: number;
  date: string;
}

const getBestTimes = (): Record<string, BestTime> => {
  const times = localStorage.getItem(BEST_TIMES_KEY);
  return times ? JSON.parse(times) : {};
};

const saveBestTime = (difficulty: string, name: string, time: number) => {
  const times = getBestTimes();
  times[difficulty] = {
    name,
    time,
    date: new Date().toISOString(),
  };
  localStorage.setItem(BEST_TIMES_KEY, JSON.stringify(times));
};

const isNewBestTime = (difficulty: string, time: number): boolean => {
  const times = getBestTimes();
  return !times[difficulty] || time < times[difficulty].time;
};

export const Minesweeper = () => {
  const searchParams = useSearchParams();
  const isDebug = searchParams.has("debug");
  const [difficulty, setDifficulty] = useState<number>(0);
  const currentConfig = DIFFICULTY_LEVELS[difficulty];

  const [gameState, setGameState] = useState<GameStateType>(() =>
    getInitialGameState(
      currentConfig.width,
      currentConfig.height,
      currentConfig
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
        currentConfig
      )
    );
  }, [currentConfig]);

  // Reset the game board when difficulty changes
  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);

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
    if (gameBoard[y][x].isRevealed) return; // Can't flag revealed cells

    const newBoard = gameBoard.map((row, rowIndex) =>
      row.map((cell, colIndex) =>
        rowIndex === y && colIndex === x
          ? { ...cell, isFlagged: !cell.isFlagged }
          : cell
      )
    );

    // Calculate the new flag count
    // @todo: should I be counting these or just maintain the count in game state?
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

  // Modify the revealCells function to handle high scores
  const handleGameWin = useCallback(
    (time: number) => {
      const difficulty = currentConfig.name;
      if (isNewBestTime(difficulty, time)) {
        setWinTime(time);
        setShowBestTimeDialog(true);
      }
    },
    [currentConfig.name]
  );

  // Checking if we have a new best time wh en the game is won
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

  return (
    <div className={styles.minesweeper}>
      <div className={`${styles.menu} ${styles.options}`}>
        <Options
          difficultyLevels={DIFFICULTY_LEVELS}
          currentDifficulty={difficulty}
          setDifficulty={setDifficulty}
        />
      </div>
      <div
        className={classNames(styles.menu, {
          [styles.victory]: gameState.status === "won",
        })}
      >
        <Count count={currentConfig.mines - gameState.flaggedMines} />
        <button onClick={resetGame} className={styles.reset}>
          {gameState.status === "won"
            ? "😎"
            : gameState.status === "lost"
            ? "😔"
            : "🙂"}
        </button>
        <Timer startTime={gameState.startTime} endTime={gameState.endTime} />
      </div>
      <div
        className={styles.board}
        style={
          {
            "--rows": currentConfig.height,
            "--cols": currentConfig.width,
          } as React.CSSProperties
        }
      >
        <div className={styles.grid}>
          {gameBoard.map((row, y) => (
            <div key={y} className={styles.row}>
              {row.map((cell, x) => (
                <Cell
                  key={`${x}-${y}`}
                  cell={cell}
                  x={x}
                  y={y}
                  onPrimaryAction={handlePrimaryAction}
                  onSecondaryAction={handleSecondaryAction}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {isDebug && (
        <pre
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            color: "white",
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
      />
    </div>
  );
};

const Timer = ({
  startTime,
  endTime,
}: {
  startTime?: number;
  endTime?: number;
}) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setTime(0);
      return;
    }

    if (endTime) {
      setTime(Math.floor((endTime - startTime) / 1000));
      return;
    }

    const interval = setInterval(() => {
      setTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  return (
    <div className={styles.scoreboard}>
      <span className="text-sm font-bold">{time}</span>
    </div>
  );
};

const Count = ({ count }: { count: number }) => {
  return (
    <div className={styles.scoreboard}>
      <span className="text-sm font-bold">{count}</span>
    </div>
  );
};

const Cell = ({
  cell,
  x,
  y,
  onPrimaryAction,
  onSecondaryAction,
}: {
  cell: CellType;
  x: number;
  y: number;
  onPrimaryAction: (x: number, y: number) => void;
  onSecondaryAction: (x: number, y: number) => void;
}) => {
  const { ...pressHandlerProps } = usePressHandler({
    onClick: () => onPrimaryAction(x, y),
    onHold: () => onSecondaryAction(x, y),
    onRightClick: () => {
      console.log("right click");
      onSecondaryAction(x, y);
    },
  });

  return (
    <button
      key={`${x}-${y}`}
      className={classNames(styles.cell, "font-mono", {
        [styles.revealed]: cell.isRevealed,
        [styles.flagged]: cell.isFlagged,
      })}
      {...pressHandlerProps}
    >
      {cell.isRevealed && (
        <>
          {cell.isMine && (
            <span className={styles.icon}>{cell.isMine && "💣"}</span>
          )}
          {cell.adjacentMines > 0 && (
            <span className={styles.count} data-count={cell.adjacentMines}>
              {cell.adjacentMines > 0 && cell.adjacentMines}
            </span>
          )}
        </>
      )}
      {cell.isFlagged && (
        <span className={classNames(styles.icon, styles.flag)}>🚩</span>
      )}
    </button>
  );
};
