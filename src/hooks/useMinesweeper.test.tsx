import { renderHook, act } from "@testing-library/react";
import { useMinesweeper } from "./useMinesweeper";
import { DIFFICULTY_LEVELS } from "../types/constants";
import * as gameUtils from "../lib/game";
import { vi, type Mock } from "vitest";
import { describe, it, expect, beforeEach } from "vitest";
import type { GameBoard } from "@/types/minesweeper";

// Mock the game utilities
vi.mock("../lib/game", () => ({
  getInitialGameState: vi.fn(),
  revealCells: vi.fn(),
  isNewBestTime: vi.fn(),
  saveBestTime: vi.fn(),
  chordClick: vi.fn(),
}));

describe("useMinesweeper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock initial game state
    (gameUtils.getInitialGameState as Mock).mockReturnValue({
      status: "playing",
      startTime: Date.now(),
      endTime: null,
      flaggedMines: 0,
      config: DIFFICULTY_LEVELS[0],
      seed: "test-seed",
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useMinesweeper({}));

    expect(result.current.gameState.status).toBe("playing");
    expect(result.current.currentDifficulty).toBe(0);
    expect(result.current.remainingMines).toBe(DIFFICULTY_LEVELS[0].mines);
    expect(result.current.showBestTimeDialog).toBe(false);
    expect(result.current.winTime).toBeNull();
  });

  it("should handle primary action (reveal cell)", () => {
    const { result } = renderHook(() => useMinesweeper({}));

    // Mock revealCells to return a valid game state
    (gameUtils.revealCells as Mock).mockReturnValue({
      gameBoard: result.current.gameBoard,
      gameState: {
        ...result.current.gameState,
        status: "in-progress",
        startTime: Date.now(),
      },
    });

    act(() => {
      result.current.handlePrimaryAction(0, 0);
    });

    expect(gameUtils.revealCells).toHaveBeenCalledWith(
      { x: 0, y: 0 },
      expect.any(Array),
      expect.any(Object)
    );
  });

  it("should handle secondary action (toggle flag)", () => {
    const { result } = renderHook(() => useMinesweeper({}));

    // Mock initial game state
    (gameUtils.getInitialGameState as Mock).mockReturnValue({
      status: "in-progress",
      startTime: Date.now(),
      endTime: null,
      flaggedMines: 0,
      config: DIFFICULTY_LEVELS[0],
      seed: "test-seed",
    });

    act(() => {
      result.current.handleSecondaryAction(0, 0);
    });

    // Check if the cell was flagged
    expect(result.current.gameBoard[0][0].isFlagged).toBe(true);
    expect(result.current.remainingMines).toBe(DIFFICULTY_LEVELS[0].mines - 1);
  });

  it("should handle tertiary action (chord click)", () => {
    const { result } = renderHook(() => useMinesweeper({}));

    // Mock initial game state to be in progress
    (gameUtils.getInitialGameState as Mock).mockReturnValue({
      status: "in-progress",
      startTime: Date.now(),
      endTime: null,
      flaggedMines: 0,
      config: DIFFICULTY_LEVELS[0],
      seed: "test-seed",
    });

    // Set the cell to revealed so chordClick will be called
    act(() => {
      result.current.gameBoard[0][0].isRevealed = true;
    });

    // Mock chordClick to return a valid game state
    (gameUtils.chordClick as Mock).mockReturnValue({
      gameBoard: result.current.gameBoard,
      gameState: {
        ...result.current.gameState,
        status: "in-progress",
      },
    });

    act(() => {
      result.current.handleTertiaryAction(0, 0);
    });

    expect(gameUtils.chordClick).toHaveBeenCalledWith(
      { x: 0, y: 0 },
      expect.any(Array),
      expect.any(Object)
    );
  });

  it("should handle difficulty change", () => {
    const { result } = renderHook(() => useMinesweeper({}));

    // Mock initial game state for the new difficulty
    (gameUtils.getInitialGameState as Mock).mockReturnValue({
      status: "not-started",
      startTime: undefined,
      endTime: undefined,
      flaggedMines: 0,
      config: DIFFICULTY_LEVELS[1],
      seed: "test-seed",
    });

    act(() => {
      result.current.handleDifficultyChange(1);
    });

    expect(result.current.currentDifficulty).toBe(1);
    expect(gameUtils.getInitialGameState).toHaveBeenCalledWith(
      DIFFICULTY_LEVELS[1].width,
      DIFFICULTY_LEVELS[1].height,
      DIFFICULTY_LEVELS[1],
      expect.any(String)
    );
  });

  it("should handle game win with new best time", () => {
    const onGameEnd = vi.fn();
    const { result } = renderHook(() => useMinesweeper({ onGameEnd }));

    // Mock a win condition
    (gameUtils.isNewBestTime as Mock).mockReturnValue(true);

    // Mock the game state to be in a winning state
    const mockGameState = {
      ...result.current.gameState,
      status: "won",
      endTime: Date.now(),
      startTime: Date.now() - 1000, // 1 second ago
    };

    (gameUtils.revealCells as Mock).mockReturnValue({
      gameBoard: result.current.gameBoard,
      gameState: mockGameState,
    });

    act(() => {
      result.current.handlePrimaryAction(0, 0);
    });

    expect(result.current.showBestTimeDialog).toBe(true);
    expect(result.current.winTime).toBe(1); // 1 second
  });

  it("should handle best time submission", () => {
    const { result } = renderHook(() => useMinesweeper({}));

    // Set up win time
    act(() => {
      result.current.handleGameWin(100);
    });

    act(() => {
      result.current.handleBestTimeSubmit("Test Player");
    });

    expect(gameUtils.saveBestTime).toHaveBeenCalledWith(
      DIFFICULTY_LEVELS[0].name,
      "Test Player",
      100
    );
    expect(result.current.showBestTimeDialog).toBe(false);
    expect(result.current.winTime).toBeNull();
  });

  it("should reset game state", () => {
    const { result } = renderHook(() => useMinesweeper({}));

    // Set up some game state
    act(() => {
      result.current.handleSecondaryAction(0, 0);
    });

    act(() => {
      result.current.resetGame();
    });

    expect(result.current.gameState.flaggedMines).toBe(0);
    expect(result.current.showBestTimeDialog).toBe(false);
    expect(result.current.winTime).toBeNull();
  });

  it("should call onGameEnd callback when game ends", () => {
    const onGameEnd = vi.fn();
    const { result } = renderHook(() => useMinesweeper({ onGameEnd }));

    // Mock a win condition with proper game state
    const mockGameState = {
      ...result.current.gameState,
      status: "won",
      endTime: Date.now(),
    };

    (gameUtils.revealCells as Mock).mockReturnValue({
      gameBoard: result.current.gameBoard,
      gameState: mockGameState,
    });

    act(() => {
      result.current.handlePrimaryAction(0, 0);
    });

    expect(onGameEnd).toHaveBeenCalledWith(mockGameState);
  });

  it("should initialize with provided initial board", () => {
    const initialBoard: GameBoard = Array(5)
      .fill(null)
      .map(() =>
        Array(5)
          .fill(null)
          .map(() => ({
            isMine: true,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          }))
      );

    const { result } = renderHook(() => useMinesweeper({ initialBoard }));

    expect(result.current.gameBoard).toBe(initialBoard);
    expect(gameUtils.getInitialGameState).toHaveBeenCalledWith(
      5, // width from initial board
      5, // height from initial board
      {
        name: "custom",
        width: 5,
        height: 5,
        mines: 25, // all cells are mines in this test board
      },
      undefined,
      initialBoard
    );
  });

  it("should prioritize initial board over seed and use custom config", () => {
    const initialBoard: GameBoard = Array(3)
      .fill(null)
      .map(() =>
        Array(3)
          .fill(null)
          .map((_, x) => ({
            isMine: x === 0, // only first column has mines
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          }))
      );

    const seed = "test-seed";
    const { result } = renderHook(() => useMinesweeper({ initialBoard, seed }));

    expect(result.current.gameBoard).toBe(initialBoard);
    expect(gameUtils.getInitialGameState).toHaveBeenCalledWith(
      3, // width from initial board
      3, // height from initial board
      {
        name: "custom",
        width: 3,
        height: 3,
        mines: 3, // only first column has mines
      },
      seed,
      initialBoard
    );
  });
});
