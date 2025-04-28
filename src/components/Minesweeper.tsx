"use client";

import { useState, useEffect, useCallback } from "react";
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

const getInitialGameState = (width: number, height: number): GameState => ({
  status: "not-started",
  flaggedMines: 0,
  remainingCells: width * height,
  startTime: null,
  endTime: null,
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

// const revealCells = (
//   cell: { x: number; y: number },
//   gameBoard: GameBoard,
//   updateGameBoard: (board: GameBoard) => void,
//   updateGameState: (state: GameState) => void
// ) => {
//   const { x, y } = cell;
//   const { width, height } = gameBoard;

// this function should recursively do the following:

// 1. if x,y is a mine, it should:
// - update every cell in GameBoard to isRevealed: true
// - update GameState to status: 'lost' and endTime to the current time

// 2. if x,y is not a mine:
//   - update the cell in GameBoard to isRevealed: true
//   -

// };

export const Minesweeper = () => {
  const [difficulty, setDifficulty] =
    useState<keyof typeof DIFFICULTY_LEVELS>("beginner");
  const currentConfig = DIFFICULTY_LEVELS[difficulty];

  const [gameState, setGameState] = useState<GameState>(() =>
    getInitialGameState(currentConfig.width, currentConfig.height)
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
      getInitialGameState(currentConfig.width, currentConfig.height)
    );
  }, [currentConfig.height, currentConfig.width]);

  // Reset the game board when difficulty changes
  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);

  console.log(gameBoard.length, gameBoard[0].length);

  const handleCellClick = (x: number, y: number) => {
    if (gameState.status === "not-started") {
      const newBoard = fillMines({ x, y }, gameBoard, currentConfig);
      setGameBoard(newBoard);
      setGameState((prev) => ({
        ...prev,
        status: "in-progress",
        startTime: Date.now(),
      }));
    }
  };

  return (
    <div>
      <h1>Minesweeper</h1>
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
                  className={styles.cell}
                  onClick={() => handleCellClick(x, y)}
                >
                  {cell.isMine && "💣"}
                  {cell.adjacentMines > 0 && cell.adjacentMines}
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
