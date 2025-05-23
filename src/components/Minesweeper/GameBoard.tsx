import classNames from "classnames";
import styles from "./minesweeper.module.css";
import type {
  GameBoard as GameBoardType,
  GameState,
  Cell,
} from "@/types/minesweeper";
import { usePressHandler } from "@/hooks/usePressHandler";
import { useStore } from "@/store";
import { useGesture } from "@use-gesture/react";
import { useSpring, animated } from "@react-spring/web";
import { useRef } from "react";
import { MineIcon } from "@/components/icons/Mine";
// import Minesvg from "@/components/icons/svg/mine.svg";

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
            // <span className={styles.icon}>{cell.isMine && "💣"}</span>
            <span className={styles.icon}>
              {/* <MineIcon size={24} /> */}
              {/* <Minesvg width={12} height={12} /> */}
              <MineIcon size={12} />
            </span>
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
  const { isMaximized } = useStore();
  const ref = useRef<HTMLDivElement>(null);

  const [springs, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    config: { tension: 400, friction: 25, immediate: true },
  }));

  const lastPosition = useRef({ x: 0, y: 0 });
  const lastScale = useRef(1);

  useGesture(
    {
      onDrag: ({ event, movement: [x, y], first }) => {
        const isTouch = (event as PointerEvent).pointerType === "touch";
        if (isMaximized && isTouch) {
          if (first) {
            // Start from the last known position
            lastPosition.current = { x: springs.x.get(), y: springs.y.get() };
          }
          // Add the movement to the last position
          api.start({
            x: lastPosition.current.x + x,
            y: lastPosition.current.y + y,
            immediate: true,
          });
        }
      },
      onPinch: ({ event, movement: [scale], first }) => {
        const isTouch = (event as PointerEvent).pointerType === "touch";
        if (isMaximized && isTouch) {
          if (first) {
            // Start from the last known scale
            lastScale.current = springs.scale.get();
          }
          // Multiply the movement with the last scale
          api.start({ scale: lastScale.current * scale, immediate: true });
        }
      },
    },
    {
      target: ref,
      drag: {
        bounds: {
          left: -1000,
          right: 1000,
          top: -1000,
          bottom: 1000,
        },
        enabled: isMaximized,
      },
      pinch: {
        scaleBounds: { min: 0.2, max: 10 },
        rubberband: true,
        enabled: isMaximized,
      },
    }
  );

  return (
    <div
      className={styles.board}
      style={
        {
          "--rows": gameState.config.height,
          "--cols": gameState.config.width,
        } as React.CSSProperties
      }
      ref={ref}
    >
      <animated.div
        className={styles.grid}
        style={isMaximized ? springs : undefined}
      >
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
      </animated.div>
    </div>
  );
};
