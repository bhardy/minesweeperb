import type {
  Level,
  GameBoard,
  GameState,
  BestTime,
} from "@/types/minesweeper";
import { BEST_TIMES_KEY } from "@/types/constants";

export const getInitialGameState = (
  width: number,
  height: number,
  config: Level
): GameState => ({
  status: "not-started",
  flaggedMines: 0,
  remainingCells: width * height,
  lastClick: undefined,
  startTime: undefined,
  endTime: undefined,
  config,
});

export const fillMines = (
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

export const revealCells = (
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
    // Reveal all mines if user clicked a mine
    const revealedBoard = gameBoard.map((row) =>
      row.map((cell) => {
        if (cell.isMine) {
          return { ...cell, isRevealed: true };
        }
        return cell;
      })
    );
    return {
      gameBoard: revealedBoard,
      gameState: {
        ...gameState,
        status: "lost",
        endTime: Date.now(),
        lastClick: { x, y },
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

  // Skip if cell is flagged
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

export const getBestTimes = (): Record<string, BestTime> => {
  const times = localStorage.getItem(BEST_TIMES_KEY);
  return times ? JSON.parse(times) : {};
};

export const saveBestTime = (
  difficulty: string,
  name: string,
  time: number
) => {
  const times = getBestTimes();
  times[difficulty] = {
    name,
    time,
    date: new Date().toISOString(),
  };
  localStorage.setItem(BEST_TIMES_KEY, JSON.stringify(times));
};

export const isNewBestTime = (difficulty: string, time: number): boolean => {
  const times = getBestTimes();
  return !times[difficulty] || time < times[difficulty].time;
};
