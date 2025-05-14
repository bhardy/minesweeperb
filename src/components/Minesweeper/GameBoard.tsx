import classNames from "classnames";
import styles from "./minesweeper.module.css";
import type {
  GameBoard as GameBoardType,
  GameState,
  Cell,
} from "@/types/minesweeper";
import { usePressHandler } from "@/hooks/usePressHandler";

interface CellProps {
  cell: Cell;
  x: number;
  y: number;
  onPrimaryAction: (x: number, y: number) => void;
  onSecondaryAction: (x: number, y: number) => void;
  onTertiaryAction: (x: number, y: number) => void;
  lastClick?: { x: number; y: number };
  holdToFlag: boolean;
}

const Cell = ({
  cell,
  x,
  y,
  onPrimaryAction,
  onSecondaryAction,
  onTertiaryAction,
  lastClick,
  holdToFlag,
}: CellProps) => {
  const { ...pressHandlerProps } = usePressHandler({
    onClick: () => {
      console.log("primary click");
      onPrimaryAction(x, y);
    },
    onHold: holdToFlag
      ? () => {
          console.log("hold click");
          onSecondaryAction(x, y);
        }
      : undefined,
    onRightClick: () => {
      console.log("secondary click");
      onSecondaryAction(x, y);
    },
    onLeftAndRightClick: () => {
      console.log("chord click");
      onTertiaryAction(x, y);
      // onSecondaryAction(x, y);
    },
  });

  const isLastClick = lastClick?.x === x && lastClick?.y === y;

  return (
    <button
      key={`${x}-${y}`}
      className={classNames(styles.cell, "font-mono", {
        [styles.revealed]: cell.isRevealed,
        [styles.flagged]: cell.isFlagged,
        [styles.losingClick]: isLastClick,
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

interface GameBoardProps {
  gameBoard: GameBoardType;
  gameState: GameState;
  onPrimaryAction: (x: number, y: number) => void;
  onSecondaryAction: (x: number, y: number) => void;
  onTertiaryAction: (x: number, y: number) => void;
  holdToFlag: boolean;
}

export const GameBoard = ({
  gameBoard,
  gameState,
  onPrimaryAction,
  onSecondaryAction,
  onTertiaryAction,
  holdToFlag,
}: GameBoardProps) => {
  return (
    <div
      className={styles.board}
      style={
        {
          "--rows": gameState.config.height,
          "--cols": gameState.config.width,
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
                onPrimaryAction={onPrimaryAction}
                onSecondaryAction={onSecondaryAction}
                onTertiaryAction={onTertiaryAction}
                lastClick={gameState.lastClick}
                holdToFlag={holdToFlag}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
