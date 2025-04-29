"use client";

import { useState, useEffect, useCallback } from "react";
import classNames from "classnames";
import styles from "./minesweeper.module.css";

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

type Level = {
  width: number;
  height: number;
  mines: number;
};

type GameBoard = Cell[][];

type GameState = {
  status: "not-started" | "in-progress" | "won" | "lost";
  flaggedMines: number;
  remainingCells: number;
  startTime: number | null;
  endTime: number | null;
  config: Level;
};

const DIFFICULTY_LEVELS: Record<string, Level> = {
  beginner: {
    width: 9,
    height: 9,
    mines: 10,
  },
  intermediate: {
    width: 16,
    height: 16,
    mines: 40,
  },
  expert: {
    width: 30,
    height: 16,
    mines: 99,
  },
};

const getInitialGameState = (
  width: number,
  height: number,
  config: Level
): GameState => ({
  status: "not-started",
  flaggedMines: 0,
  remainingCells: width * height,
  startTime: null,
  endTime: null,
  config,
});

const fillMines = (
  initialClick: { x: number; y: number },
  gameBoard: GameBoard,
  difficulty: Level
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
  gameBoard: GameBoard,
  gameState: GameState
): {
  gameBoard: GameBoard;
  gameState: GameState;
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
        flaggedMines: 0,
        remainingCells: 0,
        startTime: null,
        endTime: Date.now(),
      },
    };
  }

  return {
    gameBoard: newBoard,
    gameState: gameState,
  };
};

export const Minesweeper = () => {
  const [difficulty, setDifficulty] =
    useState<keyof typeof DIFFICULTY_LEVELS>("beginner");
  const currentConfig = DIFFICULTY_LEVELS[difficulty];

  const [gameState, setGameState] = useState<GameState>(() =>
    getInitialGameState(
      currentConfig.width,
      currentConfig.height,
      currentConfig
    )
  );

  const [gameBoard, setGameBoard] = useState<GameBoard>(() =>
    Array.from({ length: currentConfig.height }, () =>
      Array.from({ length: currentConfig.width }, () => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      }))
    )
  );

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

  const handleCellClick = (x: number, y: number) => {
    const { gameBoard: nextGameBoard, gameState: nextGameState } = revealCells(
      { x, y },
      gameBoard,
      gameState
    );

    setGameBoard(nextGameBoard);
    setGameState(nextGameState);
  };

  const handleRightClick = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault(); // Prevent context menu from appearing
    if (gameBoard[y][x].isRevealed) return; // Can't flag revealed cells

    const newBoard = gameBoard.map((row, rowIndex) =>
      row.map((cell, colIndex) =>
        rowIndex === y && colIndex === x
          ? { ...cell, isFlagged: !cell.isFlagged }
          : cell
      )
    );

    setGameBoard(newBoard);
  };

  return (
    <div>
      <button onClick={() => setDifficulty("beginner")}>Beginner</button>
      <button onClick={() => setDifficulty("intermediate")}>
        Intermediate
      </button>
      <button onClick={() => setDifficulty("expert")}>Expert</button>
      <button onClick={resetGame}>Reset</button>
      <div
        className={styles.minesweeper}
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
                <button
                  key={`${x}-${y}`}
                  className={classNames(styles.cell, {
                    [styles.revealed]: cell.isRevealed,
                  })}
                  onClick={() => handleCellClick(x, y)}
                  onContextMenu={(e) => handleRightClick(e, x, y)}
                >
                  {cell.isRevealed && (
                    <>
                      {cell.isMine && "💣"}
                      {cell.adjacentMines > 0 && cell.adjacentMines}
                    </>
                  )}
                  {cell.isFlagged && "🚩"}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <pre>{JSON.stringify(gameState, null, 2)}</pre>
    </div>
  );
};
