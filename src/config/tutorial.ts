import type { GameBoard } from "@/types/minesweeper";
import { convertTutorialBoard } from "@/lib/game";

export interface TutorialStep {
  title: string;
  description: string;
  board: string[][];
  showMineCount?: boolean;
}

export const tutorialSteps: TutorialStep[] = [
  // {
  //   title: "Revealing Cells",
  //   description:
  //     "The goal of Minesweeper is to reveal every cell that doesn't contain a mine. You can see our mine count in the top left, in this (contrived) example, we have 0 mines, so we know all the cells are safe and we can click anywhere.",
  //   board: [
  //     ["", "", "", ""],
  //     ["", "", "", ""],
  //     ["", "", "", ""],
  //   ],
  //   showMineCount: false,
  // },
  {
    title: "Numbers and Mines",
    description:
      "After cells are revealed you'll see a combination of empty cells and cells with numbers. The number is a count of how many of the adjacent cells are mines. In this example, you can see that we have 1 remaining mine and 2 unrevealed cells. See if you can reveal the safe cell.",
    board: [
      ["1", "💣", "1r", "r"],
      ["1r", "1r", "1r", "r"],
      ["r", "r", "r", "r"],
    ],
    showMineCount: false,
  },
  {
    title: "Flagging Mines",
    description:
      "Right-click (or long press on mobile) to place a flag where you think a mine is. The flag icon (🚩) helps you keep track of potential mine locations.",
    board: [
      ["1", "💣", "🚩", "1"],
      ["1r", "2r", "2r", "1r"],
      ["r", "r", "r", "r"],
      ["r", "r", "r", "r"],
    ],
    showMineCount: true,
  },
  {
    title: "Safe Zones",
    description:
      "When you reveal a cell with no adjacent mines (shown as empty), it automatically reveals all connected safe cells. This helps you clear large areas quickly.",
    board: [
      ["0r", "0r", "0r", ""],
      ["0r", "1", "0r", ""],
      ["0r", "0r", "0r", ""],
      ["", "", "", ""],
    ],
    showMineCount: false,
  },
  {
    title: "Putting it All Together",
    description:
      "Now you know the basics! Use numbers to identify mine locations, flag potential mines, and clear safe areas. Be careful - clicking a mine ends the game!",
    board: [
      ["1", "1", "1", ""],
      ["1", "💣", "1", ""],
      ["1", "1", "1", ""],
      ["", "", "", ""],
    ],
    showMineCount: true,
  },
];

export const getTutorialBoard = (step: number): GameBoard => {
  return convertTutorialBoard(tutorialSteps[step].board);
};
