import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { tutorialSteps } from "@/config/tutorial";
import { TutorialBoard } from "./TutorialBoard";

export const TutorialStep = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

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
            onStepChange={setCurrentStep}
          />
        </div>
        <Progress value={progress} className="w-full max-w-md my-8" />
      </CardContent>
    </Card>
  );
};
