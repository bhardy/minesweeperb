import type {
  Level,
  GameBoard,
  GameState,
  BestTime,
} from "@/types/minesweeper";
import { BEST_TIMES_KEY } from "@/types/constants";

// Helper function to generate deterministic mine positions based on a date
// @note: 🙀 cursor wrote this, need to review it and add tests
const generateMinePositionsFromSeed = (
  seed: string,
  width: number,
  height: number,
  mines: number
): Set<string> => {
  const minePositions = new Set<string>();

  // Create a deterministic sequence of positions
  const allCells: { x: number; y: number }[] = [];
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      allCells.push({ x: j, y: i });
    }
  }

  // Convert seed string to a numeric hash
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Ensure hash is positive
  hash = Math.abs(hash);

  while (minePositions.size < mines && allCells.length > 0) {
    hash = (hash * 31 + 17) % allCells.length;
    const position = allCells[hash];
    minePositions.add(`${position.x},${position.y}`);
    allCells.splice(hash, 1);
  }

  return minePositions;
};

// Helper function to generate random mine positions based on initial click
const generateRandomMinePositions = (
  initialClick: { x: number; y: number },
  width: number,
  height: number,
  mines: number
): Set<string> => {
  const { x, y } = initialClick;
  const allCells: { x: number; y: number }[] = [];
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      allCells.push({ x: j, y: i });
    }
  }

  const safeCells = new Set<string>();
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const adjX = x + dx;
      const adjY = y + dy;
      if (adjX >= 0 && adjX < width && adjY >= 0 && adjY < height) {
        safeCells.add(`${adjX},${adjY}`);
      }
    }
  }

  const availablePositions = allCells.filter(
    (pos) => !safeCells.has(`${pos.x},${pos.y}`)
  );

  const minePositions = new Set<string>();
  while (minePositions.size < mines && availablePositions.length > 0) {
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const position = availablePositions[randomIndex];
    minePositions.add(`${position.x},${position.y}`);
    availablePositions.splice(randomIndex, 1);
  }

  return minePositions;
};

// Helper function to find the largest connected component of safe cells
const findLargestSafeArea = (board: GameBoard): { x: number; y: number } => {
  const width = board[0].length;
  const height = board.length;
  const visited = new Set<string>();
  let largestComponent: { x: number; y: number }[] = [];
  let currentComponent: { x: number; y: number }[] = [];

  const floodFill = (x: number, y: number) => {
    const key = `${x},${y}`;
    if (
      visited.has(key) ||
      x < 0 ||
      x >= width ||
      y < 0 ||
      y >= height ||
      board[y][x].isMine ||
      board[y][x].adjacentMines !== 0
    ) {
      return;
    }

    visited.add(key);
    currentComponent.push({ x, y });

    // Check all 8 surrounding cells
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        floodFill(x + dx, y + dy);
      }
    }
  };

  // Find all connected components
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (
        !visited.has(`${x},${y}`) &&
        !board[y][x].isMine &&
        board[y][x].adjacentMines === 0
      ) {
        currentComponent = [];
        floodFill(x, y);
        if (currentComponent.length > largestComponent.length) {
          largestComponent = [...currentComponent];
        }
      }
    }
  }

  // Return the center cell of the largest component
  if (largestComponent.length > 0) {
    const centerIndex = Math.floor(largestComponent.length / 2);
    return largestComponent[centerIndex];
  }

  // Fallback to first non-mine cell if no safe area found
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!board[y][x].isMine) {
        return { x, y };
      }
    }
  }

  // This should never happen as there should always be at least one non-mine cell
  return { x: 0, y: 0 };
};

export const getInitialGameState = (
  width: number,
  height: number,
  config: Level,
  seed?: string
): GameState => ({
  status: "not-started",
  flaggedMines: 0,
  remainingCells: width * height,
  lastClick: undefined,
  startTime: undefined,
  endTime: undefined,
  config,
  seed,
});

export const fillMines = (
  initialClick: { x: number; y: number },
  gameBoard: GameBoard,
  difficulty: Level,
  seed?: string
): { board: GameBoard; safeCell: { x: number; y: number } } => {
  const { width, height, mines } = difficulty;

  let minePositions: Set<string>;

  if (seed) {
    // For seeded games, ignore initial click and use deterministic positions
    minePositions = generateMinePositionsFromSeed(seed, width, height, mines);
  } else {
    // Generating random mine positions
    minePositions = generateRandomMinePositions(
      initialClick,
      width,
      height,
      mines
    );
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

  // Find the largest safe area if using a seed
  let safeCell = initialClick;
  if (seed) {
    safeCell = findLargestSafeArea(boardWithAdjacentMines);
  }

  return {
    board: boardWithAdjacentMines,
    safeCell,
  };
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

  // todo, maybe this should be handled higher up?
  if (gameState.status === "lost") {
    return {
      gameBoard,
      gameState,
    };
  }

  if (gameState.status === "not-started") {
    const { board: initialBoard, safeCell } = fillMines(
      cell,
      gameBoard,
      gameState.config,
      gameState.seed
    );
    const startGameState = {
      ...gameState,
      status: "in-progress" as const,
      startTime: Date.now(),
    };
    // Use the safe cell if we have a seed, otherwise use the initial click
    return revealCells(
      gameState.seed ? safeCell : cell,
      initialBoard,
      startGameState
    );
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

export const chordClick = (
  cell: { x: number; y: number },
  gameBoard: GameBoard,
  gameState: GameState
) => {
  const { x, y } = cell;
  const width = gameBoard[0].length;
  const height = gameBoard.length;

  // 1. Check if cell is already revealed
  if (!gameBoard[y][x].isRevealed) {
    return { gameBoard, gameState };
  }

  // 2. Check if cell has adjacent mines
  if (gameBoard[y][x].adjacentMines === 0) {
    return { gameBoard, gameState };
  }

  // 3. Count adjacent flagged cells
  let flaggedCount = 0;
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

      if (gameBoard[newY][newX].isFlagged) {
        flaggedCount++;
      }
    }
  }

  // Check if flagged count matches adjacent mines
  if (flaggedCount !== gameBoard[y][x].adjacentMines) {
    return { gameBoard, gameState };
  }

  // 4. Get list of adjacent cells that aren't flagged or revealed
  const cellsToReveal: { x: number; y: number }[] = [];
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

      if (
        !gameBoard[newY][newX].isFlagged &&
        !gameBoard[newY][newX].isRevealed
      ) {
        cellsToReveal.push({ x: newX, y: newY });
      }
    }
  }

  // 5. Reveal each cell
  let newBoard = gameBoard;
  let newGameState = gameState;
  for (const cell of cellsToReveal) {
    const result = revealCells(cell, newBoard, newGameState);
    newBoard = result.gameBoard;
    newGameState = result.gameState;

    // Stop if game is over
    if (newGameState.status === "lost" || newGameState.status === "won") {
      break;
    }
  }

  return { gameBoard: newBoard, gameState: newGameState };
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
