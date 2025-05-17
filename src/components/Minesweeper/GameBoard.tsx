import classNames from "classnames";
import styles from "./minesweeper.module.css";
import type {
  GameBoard as GameBoardType,
  GameState,
  Cell,
} from "@/types/minesweeper";
import { usePressHandler } from "@/hooks/usePressHandler";
import { useStore } from "@/store";

interface CellProps {
  cell: Cell;
  x: number;
  y: number;
  onPrimaryAction: (x: number, y: number) => void;
  onSecondaryAction: (x: number, y: number) => void;
  onTertiaryAction: (x: number, y: number) => void;
  lastClick?: { x: number; y: number };
}

const Cell = ({
  cell,
  x,
  y,
  onPrimaryAction,
  onSecondaryAction,
  onTertiaryAction,
  lastClick,
}: CellProps) => {
  const { gameSettings } = useStore();
  const settings = cell.isRevealed
    ? gameSettings.revealedCells
    : gameSettings.unrevealedCells;

  const handleAction = (action: string) => {
    switch (action) {
      case "reveal":
        onPrimaryAction(x, y);
        break;
      case "flag":
        onSecondaryAction(x, y);
        break;
      case "quick-reveal":
        onTertiaryAction(x, y);
        break;
      case "none":
        // Do nothing
        break;
    }
  };

  const { ...pressHandlerProps } = usePressHandler({
    onClick: () => handleAction(settings.leftClick),
    onHold:
      settings.hold !== "none" ? () => handleAction(settings.hold) : undefined,
    onRightClick: () => handleAction(settings.rightClick),
    onLeftAndRightClick: () => handleAction(settings.leftRightClick),
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
}

export const GameBoard = ({
  gameBoard,
  gameState,
  onPrimaryAction,
  onSecondaryAction,
  onTertiaryAction,
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
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
