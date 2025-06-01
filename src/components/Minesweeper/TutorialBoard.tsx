import { useEffect, useState } from "react";
import classNames from "classnames";
import styles from "./minesweeper.module.css";
import { GameBoard } from "./GameBoard";
import { Count } from "./Scoreboard";
import { useStore } from "@/store";
import { useMediaQuery } from "@react-hook/media-query";
import { HappyIcon, SadIcon, SunglassesIcon } from "@/components/icons";
import { useMinesweeper } from "@/hooks/useMinesweeper";
import { getTutorialBoard } from "@/config/tutorial";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GameState } from "@/types/minesweeper";

interface TutorialBoardProps {
  step: number;
  onGameStateChange: (gameState: GameState) => void;
}

export const TutorialBoard = ({
  step,
  onGameStateChange,
}: TutorialBoardProps) => {
  const { gameSettings, resetToDefaultSettings } = useStore();
  const [showModal, setShowModal] = useState(false);
  const {
    gameBoard,
    gameState,
    remainingMines,
    resetGame,
    handlePrimaryAction,
    handleSecondaryAction,
    handleTertiaryAction,
  } = useMinesweeper({
    initialBoard: getTutorialBoard(step),
    onGameEnd: () => {
      if (gameState.status === "lost") {
        setShowModal(true);
      }
    },
  });

  useEffect(() => {
    onGameStateChange(gameState);
  }, [gameState, onGameStateChange]);

  // @note: this is mostly just for development as this can only really happen
  // if the user toggles settings in dev tools
  const isTouchDevice = useMediaQuery("(pointer: coarse)");
  useEffect(() => {
    resetToDefaultSettings();
  }, [isTouchDevice, resetToDefaultSettings]);

  return (
    <>
      <div
        className={classNames(styles.minesweeper, {
          [styles.quickFlagMode]: gameSettings.quickFlagMode,
        })}
      >
        <div
          className={classNames(styles.jumbotron, {
            [styles.victory]: gameState.status === "won",
          })}
        >
          <Count count={remainingMines} />
          <button
            onClick={(e) => {
              resetGame();
              e.currentTarget.blur();
            }}
            className={styles.reset}
          >
            {gameState.status === "won" ? (
              <SunglassesIcon />
            ) : gameState.status === "lost" ? (
              <SadIcon />
            ) : (
              <HappyIcon />
            )}
          </button>
        </div>
        <GameBoard
          gameBoard={gameBoard}
          gameState={gameState}
          onPrimaryAction={handlePrimaryAction}
          onSecondaryAction={handleSecondaryAction}
          onTertiaryAction={handleTertiaryAction}
        />
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Not quite!</DialogTitle>
            <DialogDescription className="sr-only">
              You made a mistake, try again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p>
              Don&apos;t worry, you can try again by clicking the game reset
              button (🙁).
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowModal(false)}>Okay</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
