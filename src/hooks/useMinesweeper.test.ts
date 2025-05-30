import { describe, it, expect } from "vitest";
import { gameReducer } from "./useMinesweeper";
import { DIFFICULTY_LEVELS } from "@/types/constants";
import type { GameState } from "@/types/minesweeper";
import { convertTutorialBoard } from "@/lib/game";

describe("gameReducer", () => {
  const config = DIFFICULTY_LEVELS[0];

  it("should preserve flags when revealing cells in initial board", () => {
    // Create an initial board using tutorial syntax
    const tutorialBoard = [
      ["", "1", "1"],
      ["1", "🚩", "2"],
      ["", "2", "💣"],
    ];

    const initialBoard = convertTutorialBoard(tutorialBoard);

    const initialState = {
      // Use a copy of the initial board as the game board
      gameBoard: initialBoard.map((row) => row.map((cell) => ({ ...cell }))),
      gameState: {
        status: "not-started" as const,
        flaggedMines: 1, // One flag in the initial board
        remainingCells: config.width * config.height,
        config,
        initialBoard,
      } satisfies GameState,
    };

    // Try to reveal a cell that's not flagged
    const result = gameReducer(initialState, {
      type: "REVEAL_CELL",
      payload: { x: 0, y: 0 },
    });

    // Verify that:
    // 1. The game started
    expect(result.gameState.status).toBe("in-progress");
    // 2. The flag count is preserved
    expect(result.gameState.flaggedMines).toBe(1);
    // 3. The flagged cell is still flagged
    expect(result.gameBoard[1][1].isFlagged).toBe(true);
    // 4. The clicked cell is revealed
    expect(result.gameBoard[0][0].isRevealed).toBe(true);
    // 5. The mine is still in place
    expect(result.gameBoard[2][2].isMine).toBe(true);
  });
});
