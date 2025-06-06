import classNames from "classnames";
import { useMediaQuery } from "@react-hook/media-query";
import type {
  GameBoard as GameBoardType,
  GameState,
  Cell,
} from "@/types/minesweeper";
import { usePressHandler } from "@/hooks/usePressHandler";
import { useStore } from "@/store";
import { useGesture } from "@use-gesture/react";
import { useSpring, animated } from "@react-spring/web";
import { useRef, memo, useCallback, useMemo, useState, useEffect } from "react";
import { MineIcon } from "@/components/icons/Mine";
import { FlagIcon } from "@/components/icons/Flag";
import styles from "./minesweeper.module.css";

interface CellProps {
  cell: Cell;
  x: number;
  y: number;
  onPrimaryAction: (x: number, y: number) => void;
  onSecondaryAction: (x: number, y: number) => void;
  onTertiaryAction: (x: number, y: number) => void;
  lastClick?: { x: number; y: number };
}

const CellContent = memo(({ cell }: { cell: Cell }) => {
  if (cell.isRevealed) {
    if (cell.isMine && cell.isFlagged) {
      return (
        <span className={styles.icon}>
          <FlagIcon />
        </span>
      );
    }
    if (cell.isMine) {
      return (
        <span className={styles.icon}>
          <MineIcon />
        </span>
      );
    }
    if (cell.isFlagged) {
      return (
        <span className={classNames(styles.icon, styles.incorrectFlag)}>
          <FlagIcon />
        </span>
      );
    }
    if (cell.adjacentMines > 0) {
      return (
        <span className={styles.count} data-count={cell.adjacentMines}>
          {cell.adjacentMines}
        </span>
      );
    }
    return null;
  }
  if (cell.isFlagged) {
    return (
      <span className={classNames(styles.icon, styles.flag)}>
        <FlagIcon />
      </span>
    );
  }
  return null;
});

CellContent.displayName = "CellContent";

const Cell = memo(
  ({
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

    // For unrevealed cells in quick flag mode, flip left click and hold actions
    const getAction = (action: string) => {
      if (!cell.isRevealed && gameSettings.quickFlagMode) {
        if (action === "reveal") return "flag";
        if (action === "flag") return "reveal";
      }
      return action;
    };

    const { ...pressHandlerProps } = usePressHandler({
      onClick: () => handleAction(getAction(settings.leftClick)),
      onHold:
        settings.hold !== "none"
          ? () => handleAction(getAction(settings.hold))
          : undefined,
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
        <CellContent cell={cell} />
      </button>
    );
  }
);

Cell.displayName = "Cell";

interface GameBoardProps {
  gameBoard: GameBoardType;
  gameState: GameState;
  onPrimaryAction: (x: number, y: number) => void;
  onSecondaryAction: (x: number, y: number) => void;
  onTertiaryAction: (x: number, y: number) => void;
}

export const GameBoard = memo(
  ({
    gameBoard,
    gameState,
    onPrimaryAction,
    onSecondaryAction,
    onTertiaryAction,
  }: GameBoardProps) => {
    const isMaximized = useMediaQuery("(pointer: coarse)");
    const [mounted, setMounted] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // @note: this is a workaround to address the hydration mismatch on the animated.div
    useEffect(() => {
      setMounted(true);
    }, []);

    const [springs, api] = useSpring(() => ({
      x: 0,
      y: 0,
      scale: 1,
      config: { tension: 400, friction: 25, immediate: true },
    }));

    const lastPosition = useRef({ x: 0, y: 0 });
    const lastScale = useRef(1);

    const memoizedGameBoard = useMemo(() => gameBoard, [gameBoard]);

    const handlePrimaryAction = useCallback(
      (x: number, y: number) => {
        onPrimaryAction(x, y);
      },
      [onPrimaryAction]
    );

    const handleSecondaryAction = useCallback(
      (x: number, y: number) => {
        onSecondaryAction(x, y);
      },
      [onSecondaryAction]
    );

    const handleTertiaryAction = useCallback(
      (x: number, y: number) => {
        onTertiaryAction(x, y);
      },
      [onTertiaryAction]
    );

    useGesture(
      {
        // @note: these pointerType checks may not be necessary since we are
        // also checking the pointer type with `isMaximized`
        onDrag: ({ event, movement: [x, y], first }) => {
          if ((event as PointerEvent).pointerType !== "touch") return;

          if (first) {
            lastPosition.current = { x: springs.x.get(), y: springs.y.get() };
          }
          api.start({
            x: lastPosition.current.x + x,
            y: lastPosition.current.y + y,
            immediate: true,
          });
        },
        onPinch: ({ event, movement: [scale], first }) => {
          if ((event as PointerEvent).pointerType !== "touch") return;

          if (first) {
            lastScale.current = springs.scale.get();
          }
          api.start({ scale: lastScale.current * scale, immediate: true });
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
        className={classNames(styles.board, "stippled-background")}
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
          style={mounted && isMaximized ? springs : undefined}
        >
          {memoizedGameBoard.map((row, y) => (
            <div key={y} className={styles.row}>
              {row.map((cell, x) => (
                <Cell
                  key={`${x}-${y}`}
                  cell={cell}
                  x={x}
                  y={y}
                  onPrimaryAction={handlePrimaryAction}
                  onSecondaryAction={handleSecondaryAction}
                  onTertiaryAction={handleTertiaryAction}
                  lastClick={gameState.lastClick}
                />
              ))}
            </div>
          ))}
        </animated.div>
      </div>
    );
  }
);

GameBoard.displayName = "GameBoard";
