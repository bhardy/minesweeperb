import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { useRouter } from "next/navigation";

type GameResult = "won" | "lost" | null;

interface ArchiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchiveDialog = ({ isOpen, onClose }: ArchiveDialogProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [gameResults, setGameResults] = useState<Record<string, GameResult>>(
    {}
  );
  const router = useRouter();

  useEffect(() => {
    const storedResults = localStorage.getItem("dailyChallengeResults");
    if (storedResults) {
      setGameResults(JSON.parse(storedResults));
    }
  }, []);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleDayClick = (date: Date) => {
    const formattedDate = format(date, "MMMM-d-yy").toLowerCase();
    router.push(`/daily/${formattedDate}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {format(currentMonth, "MMMM yyyy")}
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium">
              {day}
            </div>
          ))}
          {days.map((day) => {
            const formattedDate = format(day, "MMMM-d-yy").toLowerCase();
            const result = gameResults[formattedDate];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square p-1 text-sm
                  ${!isCurrentMonth ? "opacity-50" : ""}
                  ${isCurrentDay ? "ring-2 ring-primary" : ""}
                  ${
                    result === "won"
                      ? "bg-green-100 hover:bg-green-200"
                      : result === "lost"
                      ? "bg-red-100 hover:bg-red-200"
                      : "bg-gray-100 hover:bg-gray-200"
                  }
                `}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
