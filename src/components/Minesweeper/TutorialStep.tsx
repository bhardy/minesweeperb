import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { tutorialSteps } from "@/config/tutorial";
import { TutorialBoard } from "./TutorialBoard";

export const TutorialStep = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Progress
          value={currentStep}
          max={tutorialSteps.length}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{tutorialSteps[currentStep].title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{tutorialSteps[currentStep].description}</p>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center">
          <TutorialBoard step={currentStep} onStepChange={setCurrentStep} />
        </div>
      </div>
    </div>
  );
};
