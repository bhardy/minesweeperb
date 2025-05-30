import type { GameBoard } from "@/types/minesweeper";
import { convertTutorialBoard } from "@/lib/game";

export interface TutorialStep {
  title: string;
  description: string;
  board: string[][];
}

export const tutorialSteps: TutorialStep[] = [
  {
    title: "Revealing Cells",
    description:
      "The goal of Minesweeper is to reveal every cell that doesn't contain a mine. You can see your mine count in the top-left, in this (contrived) example, we have 0 mines, so we know all the cells are safe and we can click any cell on the board below.",
    board: [
      ["", "", "", ""],
      ["", "", "", ""],
      ["", "", "", ""],
    ],
  },
  {
    title: "Safe Zones",
    description:
      "When you reveal a cell with no adjacent mines, it automatically reveals all connected safe cells. Click and reveal a safe cell.",
    board: [
      ["🚩", "1r", "", ""],
      ["1r", "1r", "", ""],
      ["", "", "", ""],
      ["", "", "", ""],
    ],
  },
  {
    title: "Numbers and Mines",
    description:
      "After cells are revealed you'll see a combination of empty cells and cells with numbers. The number is a count of how many of the adjacent cells are mines. In this example, you can see that we have 1 remaining mine and 2 unrevealed cells. See if you can reveal the safe cell.",
    board: [
      ["1", "💣", "1r", "r"],
      ["1r", "1r", "1r", "r"],
      ["r", "r", "r", "r"],
    ],
  },
  {
    title: "Flagging Mines",
    description:
      "Right-click (or long press on mobile) to place a flag where you think a mine is. The flag icon (🚩) helps you keep track of mine locations. We've given you your first flag, flag the other mine and reveal the safe cells.",
    board: [
      ["1", "💣", "🚩", "1"],
      ["1r", "2r", "2r", "1r"],
      ["r", "r", "r", "r"],
      ["r", "r", "r", "r"],
    ],
  },
  {
    title: "Common Pattern (1)",
    description:
      "Take a look at this 3, since it only touches 3 unrevealedcells, we can can solve the problem.",
    board: [
      ["r", "r", "r", "r", "r"],
      ["1r", "2r", "3r", "2r", "1r"],
      ["1", "💣", "💣", "💣", "1"],
    ],
  },
  {
    title: "Common Pattern (2)",
    description:
      "Based on what you've learned, let's see if we can figure out how to solve a cornered 2.",
    board: [
      ["1r", "2r", "2r", "1r"],
      ["1r", "💣", "💣", "1"],
      ["1", "2", "2", "1"],
    ],
  },
  {
    title: "Common Patterns (3)",
    description:
      "Let's take that last example a bit further and look at a common pattern: 1-2-2-1. Since we know the 1s can only be touching 1 mine, we should be able to solve the puzzle.",
    board: [
      ["1", "2", "2", "1"],
      ["1", "💣", "💣", "1"],
      ["1r", "2r", "2r", "1r"],
      ["r", "r", "r", "r"],
    ],
  },
  {
    title: "Common Patterns (3)",
    description: "Let's see if you can solve the 1-2-1 on your own.",
    board: [
      ["r", "r", "r", "r", "r"],
      ["1r", "1r", "2r", "1r", "1r"],
      ["1", "💣", "2", "💣", "1"],
    ],
  },
  {
    title: "Reduction",
    description:
      "Common patterns are even more common than they appear on the surface level. Subtracting adjacent flags from visible numbers can help you uncover easier to solve common patterns. Can you find the common pattern?",
    board: [
      ["r", "1r", "🚩", "1r", "r"],
      ["1r", "2r", "3r", "2r", "1r"],
      ["1", "💣", "2", "💣", "1"],
    ],
  },
  {
    title: "Auto-Reveal",
    description:
      "To improve your speed, you can use the auto-reveal feature. Clicking on a revealed numbered cell, that already has that same number of adjacent flags, will automatically reveal all other touching cells. Be careful, if you've misplaced a flag, this is a quick way to lose!",
    board: [
      ["r", "1r", "🚩", "1r", "r"],
      ["1r", "2r", "3r", "2r", "1r"],
      ["1", "💣", "2", "🚩", "1"],
      ["1", "1", "2", "1", "1"],
    ],
  },
];

export const getTutorialBoard = (step: number): GameBoard => {
  return convertTutorialBoard(tutorialSteps[step].board);
};
