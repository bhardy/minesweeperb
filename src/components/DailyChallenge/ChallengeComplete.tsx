import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/store";
import { DayResult } from "./DayResult";
import { Button } from "@/components/ui/button";

interface ChallengeCompleteProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  time: number;
  difficulty: string;
  seed?: string;
}

export const ChallengeComplete = ({
  isOpen,
  onClose,
  onSubmit,
  time,
  difficulty,
  seed,
}: ChallengeCompleteProps) => {
  const { dailyChallengeResults: results } = useStore();

  const date = seed || "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Challenge Complete!</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          You completed the {difficulty} challenge in {time} seconds!
        </DialogDescription>
        <div className="flex flex-col gap-4">
          <DayResult results={results} date={date} />
          <Button
            onClick={() => onSubmit("")}
            variant="default"
            className="mt-4"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
