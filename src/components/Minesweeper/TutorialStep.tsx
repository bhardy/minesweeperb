import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { tutorialSteps } from "@/config/tutorial";
import { TutorialBoard } from "./TutorialBoard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { GameState } from "@/types/minesweeper";

export const TutorialStep = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setGameState(null);
    }
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
    setGameState(null);
  };

  const handleEnd = () => {
    router.push("/");
  };

  return (
    <Card className="w-full max-w-md mx-auto my-auto">
      <CardHeader>
        <CardTitle>{tutorialSteps[currentStep].title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{tutorialSteps[currentStep].description}</p>
        <div className="flex items-center justify-center my-8">
          <TutorialBoard
            key={currentStep}
            step={currentStep}
            onGameStateChange={setGameState}
          />
        </div>
        <Progress value={progress} className="w-full max-w-md my-8" />
        <div className="flex justify-between items-center gap-4 mt-4">
          {currentStep === 0 ? (
            <Button variant="secondary" onClick={handleEnd} size="sm">
              <ChevronLeft />
              Return to Game
            </Button>
          ) : (
            <Button variant="secondary" onClick={handlePrevious} size="sm">
              <ChevronLeft />
              Previous
            </Button>
          )}

          {isLastStep ? (
            <Button
              variant={gameState?.status === "won" ? "default" : "secondary"}
              onClick={handleEnd}
              size="sm"
            >
              Play Minesweeper
              <ChevronRight />
            </Button>
          ) : (
            <Button
              variant={gameState?.status === "won" ? "default" : "secondary"}
              onClick={handleNext}
              size="sm"
            >
              Next Step
              <ChevronRight />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
