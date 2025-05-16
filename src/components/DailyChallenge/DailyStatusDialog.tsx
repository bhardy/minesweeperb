"use client";

import { format, parse } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DayResult } from "./DayResult";
import { useStore } from "@/store";

interface DailyDialogProps {
  date: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DailyStatusDialog({ date, isOpen, onClose }: DailyDialogProps) {
  const { dailyChallengeResults: results } = useStore();

  const dateObj = parse(date, "MMMM-d-yy", new Date());
  const formattedDate = format(dateObj, "MMMM d, yyyy");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>{formattedDate}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Results for {formattedDate}
        </DialogDescription>
        <DayResult results={results} date={date} />
      </DialogContent>
    </Dialog>
  );
}
