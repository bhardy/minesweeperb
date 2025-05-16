"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/store";

interface RecordsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordsDialog = ({ isOpen, onClose }: RecordsDialogProps) => {
  const { bestTimes } = useStore();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Best Times</DialogTitle>
          <DialogDescription className="sr-only">
            Your best times for each difficulty
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {Object.entries(bestTimes).length === 0 ? (
            <p className="text-sm text-muted-foreground ">No records yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(bestTimes).map(([difficulty, record]) => (
                <div key={difficulty} className="space-y-1">
                  <h3 className="font-semibold capitalize">{difficulty}</h3>
                  {record && (
                    <div className="text-sm">
                      <span className="font-semibold">{record.name}</span>:{" "}
                      {record.time} seconds
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
