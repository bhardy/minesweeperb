import { describe, it, expect } from "vitest";
import {
  getInitialGameState,
  fillMines,
  revealCells,
  chordClick,
  convertTutorialBoard,
} from "./game";
import { DIFFICULTY_LEVELS } from "@/types/constants";
import type { GameBoard, GameState } from "@/types/minesweeper";

describe("game.ts", () => {
  describe("getInitialGameState", () => {
    it("should create initial game state with correct dimensions", () => {
      const config = DIFFICULTY_LEVELS[0];
      const state = getInitialGameState(config.width, config.height, config);

      expect(state.status).toBe("not-started");
      expect(state.flaggedMines).toBe(0);
      expect(state.remainingCells).toBe(config.width * config.height);
      expect(state.config).toBe(config);
    });

    it("should include seed if provided", () => {
      const config = DIFFICULTY_LEVELS[0];
      const seed = "test-seed";
      const state = getInitialGameState(
        config.width,
        config.height,
        config,
        seed
      );

      expect(state.seed).toBe(seed);
    });
  });

  describe("fillMines", () => {
    const initialClick = { x: 0, y: 0 };
    const config = DIFFICULTY_LEVELS[0];
    const emptyBoard: GameBoard = Array(config.height)
      .fill(null)
      .map(() =>
        Array(config.width)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          }))
      );

    it("should use initial board if provided", () => {
      const initialBoard = emptyBoard.map((row, y) =>
        row.map((cell, x) => ({
          ...cell,
          isMine: x === 0 && y === 0,
          isRevealed: true,
          adjacentMines: 1,
        }))
      );

      const { board } = fillMines(
        initialClick,
        emptyBoard,
        config,
        undefined,
        initialBoard
      );
      expect(board).toBe(initialBoard);
    });

    it("should prioritize initial board over seed", () => {
      const initialBoard = emptyBoard.map((row, y) =>
        row.map((cell, x) => ({
          ...cell,
          isMine: x === 0 && y === 0,
          isRevealed: true,
          adjacentMines: 1,
        }))
      );

      const seed = "test-seed";
      const { board } = fillMines(
        initialClick,
        emptyBoard,
        config,
        seed,
        initialBoard
      );
      expect(board).toBe(initialBoard);
    });

    it("should fill mines randomly when no seed provided", () => {
      const { board } = fillMines(initialClick, emptyBoard, config);

      // Count mines
      const mineCount = board.reduce(
        (count, row) =>
          count +
          row.reduce((rowCount, cell) => rowCount + (cell.isMine ? 1 : 0), 0),
        0
      );

      expect(mineCount).toBe(config.mines);
    });

    it("should fill mines deterministically when seed provided", () => {
      const seed = "test-seed";
      const { board: board1 } = fillMines(
        initialClick,
        emptyBoard,
        config,
        seed
      );
      const { board: board2 } = fillMines(
        initialClick,
        emptyBoard,
        config,
        seed
      );

      // Boards should be identical with same seed
      expect(board1).toEqual(board2);
    });

    it("should calculate adjacent mines correctly", () => {
      const { board } = fillMines(initialClick, emptyBoard, config);

      // Check that adjacent mine counts are correct
      for (let y = 0; y < config.height; y++) {
        for (let x = 0; x < config.width; x++) {
          if (!board[y][x].isMine) {
            let expectedCount = 0;
            // Check all 8 surrounding cells
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const adjX = x + dx;
                const adjY = y + dy;
                if (
                  adjX >= 0 &&
                  adjX < config.width &&
                  adjY >= 0 &&
                  adjY < config.height &&
                  board[adjY][adjX].isMine
                ) {
                  expectedCount++;
                }
              }
            }
            expect(board[y][x].adjacentMines).toBe(expectedCount);
          }
        }
      }
    });
  });

  describe("revealCells", () => {
    const config = DIFFICULTY_LEVELS[0];
    const emptyBoard: GameBoard = Array(config.height)
      .fill(null)
      .map(() =>
        Array(config.width)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          }))
      );

    it("should not reveal cells if game is lost", () => {
      const gameState: GameState = {
        status: "lost",
        flaggedMines: 0,
        remainingCells: config.width * config.height,
        config,
      };

      const result = revealCells({ x: 0, y: 0 }, emptyBoard, gameState);
      expect(result.gameBoard).toEqual(emptyBoard);
      expect(result.gameState).toEqual(gameState);
    });

    it("should initialize game on first click", () => {
      const gameState: GameState = {
        status: "not-started",
        flaggedMines: 0,
        remainingCells: config.width * config.height,
        config,
      };

      const result = revealCells({ x: 0, y: 0 }, emptyBoard, gameState);
      expect(result.gameState.status).toBe("in-progress");
      expect(result.gameState.startTime).toBeDefined();
    });

    it("should reveal cell and adjacent cells when clicking empty cell", () => {
      // Create a board with a known pattern
      const board = emptyBoard.map((row, y) =>
        row.map((cell, x) => ({
          ...cell,
          isMine: x === 2 && y === 2, // Mine in center
          adjacentMines: x === 2 && y === 2 ? 0 : 1, // All adjacent cells have 1 mine
        }))
      );

      const gameState: GameState = {
        status: "in-progress",
        flaggedMines: 0,
        remainingCells: config.width * config.height,
        config,
        startTime: Date.now(),
      };

      const result = revealCells({ x: 0, y: 0 }, board, gameState);
      expect(result.gameBoard[0][0].isRevealed).toBe(true);
    });
  });

  describe("chordClick", () => {
    const config = DIFFICULTY_LEVELS[0];
    const emptyBoard: GameBoard = Array(config.height)
      .fill(null)
      .map(() =>
        Array(config.width)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          }))
      );

    it("should not chord click unrevealed cells", () => {
      const gameState: GameState = {
        status: "in-progress",
        flaggedMines: 0,
        remainingCells: config.width * config.height,
        config,
        startTime: Date.now(),
      };

      const result = chordClick({ x: 0, y: 0 }, emptyBoard, gameState);
      expect(result.gameBoard).toEqual(emptyBoard);
      expect(result.gameState).toEqual(gameState);
    });

    it("should not chord click cells with no adjacent mines", () => {
      const board = emptyBoard.map((row, y) =>
        row.map((cell, x) => ({
          ...cell,
          isRevealed: x === 0 && y === 0,
          adjacentMines: 0,
        }))
      );

      const gameState: GameState = {
        status: "in-progress",
        flaggedMines: 0,
        remainingCells: config.width * config.height,
        config,
        startTime: Date.now(),
      };

      const result = chordClick({ x: 0, y: 0 }, board, gameState);
      expect(result.gameBoard).toEqual(board);
      expect(result.gameState).toEqual(gameState);
    });
  });

  describe("convertTutorialBoard", () => {
    it.only("should convert tutorial board format correctly", () => {
      const tutorialBoard = [
        ["r", "1", "2"],
        ["3", "4", "5"],
        ["6", "7", "8"],
      ];

      const result = convertTutorialBoard(tutorialBoard);

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveLength(3);
      expect(result[0][0]).toEqual({
        isMine: false,
        isRevealed: true,
        isFlagged: false,
        adjacentMines: 0,
      });
      expect(result[0][1]).toEqual({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 1,
      });
    });

    it("should handle flags and mines correctly", () => {
      const tutorialBoard = [
        ["🚩", "💣", "2"],
        ["3", "4", "5"],
        ["6", "7", "8"],
      ];

      const result = convertTutorialBoard(tutorialBoard);

      expect(result[0][0]).toEqual({
        isMine: true,
        isRevealed: false,
        isFlagged: true,
        adjacentMines: 0,
      });
      expect(result[0][1]).toEqual({
        isMine: true,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      });
    });
  });
});
