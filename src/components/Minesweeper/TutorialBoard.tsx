import { useEffect, useState } from "react";
import classNames from "classnames";
import styles from "./minesweeper.module.css";
import { GameBoard } from "./GameBoard";
import { Count } from "./Scoreboard";
import { useStore } from "@/store";
import { useMediaQuery } from "@react-hook/media-query";
import { HappyIcon, SadIcon, SunglassesIcon } from "@/components/icons";
import { useMinesweeper } from "@/hooks/useMinesweeper";
import { getTutorialBoard, tutorialSteps } from "@/config/tutorial";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface TutorialBoardProps {
  step: number;
  onStepChange: (step: number) => void;
}

export const TutorialBoard = ({ step, onStepChange }: TutorialBoardProps) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const { gameSettings, resetToDefaultSettings } = useStore();
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
      setShowModal(true);
    },
  });

  console.log(gameBoard);

  // @note: this is mostly just for development as this can only really happen
  // if the user toggles settings in dev tools
  const isTouchDevice = useMediaQuery("(pointer: coarse)");
  useEffect(() => {
    resetToDefaultSettings();
  }, [isTouchDevice, resetToDefaultSettings]);

  const handleNext = () => {
    setShowModal(false);
    if (step < tutorialSteps.length - 1) {
      onStepChange(step + 1);
      resetGame();
    } else {
      router.push("/");
    }
  };

  const handleRetry = () => {
    setShowModal(false);
    resetGame();
  };

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {gameState.status === "won" ? "Great job!" : "Try again!"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p>
              {gameState.status === "won"
                ? step < tutorialSteps.length - 1
                  ? "You've completed this step! Ready for the next one?"
                  : "You've completed the tutorial! Ready to play the real game?"
                : "Don't worry, you can try this step again!"}
            </p>
            <div className="flex justify-end gap-2">
              {gameState.status === "won" ? (
                <Button onClick={handleNext}>
                  {step < tutorialSteps.length - 1 ? "Next Step" : "Play Game"}
                </Button>
              ) : (
                <Button onClick={handleRetry}>Try Again</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
