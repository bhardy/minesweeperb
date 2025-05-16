import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/store";
import { DayResult } from "./DayResult";

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
          <button
            onClick={() => onSubmit("")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
