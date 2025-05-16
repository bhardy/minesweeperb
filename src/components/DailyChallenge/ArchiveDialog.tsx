import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  isAfter,
  startOfDay,
} from "date-fns";
import { useRouter, useParams } from "next/navigation";
import classNames from "classnames";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/store";
import type { GameResult, DifficultyKey } from "@/store";

interface ArchiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchiveDialog = ({ isOpen, onClose }: ArchiveDialogProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [difficulty, setDifficulty] = useState("beginner");
  const { dailyChallengeResults: storedResults } = useStore();
  const [gameResults, setGameResults] = useState<Record<string, GameResult>>(
    {}
  );
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const difficultyResults = storedResults[difficulty as DifficultyKey];
    setGameResults(difficultyResults);
  }, [difficulty, storedResults]);

  useEffect(() => {
    // Get difficulty from route params
    const pathDifficulty = params?.difficulty as string;
    if (
      pathDifficulty &&
      ["beginner", "intermediate", "expert"].includes(pathDifficulty)
    ) {
      setDifficulty(pathDifficulty);
    }
  }, [params]);

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
    router.push(`/daily/${formattedDate}/${difficulty}`);
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
          <DialogDescription className="sr-only">
            Complete daily challenges on beginner, intermediate, and expert.
          </DialogDescription>
        </DialogHeader>

        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full mb-4">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>

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
            const isFutureDate = isAfter(
              startOfDay(day),
              startOfDay(new Date())
            );

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                disabled={isFutureDate}
                className={classNames("aspect-square p-1 text-sm color-white", {
                  "opacity-50": !isCurrentMonth,
                  "border-2 border-primary": isCurrentDay,
                  "bg-green-500 hover:bg-green-600": result?.status === "won",
                  "bg-blue-500 hover:bg-blue-600":
                    result?.status === "won-retry",
                  "bg-red-500 hover:bg-red-600": result?.status === "lost",
                  "text-white":
                    result?.status === "won" ||
                    result?.status === "lost" ||
                    result?.status === "won-retry",
                  "bg-gray-100 hover:bg-gray-200": !result,
                  "cursor-not-allowed opacity-30": isFutureDate,
                })}
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
