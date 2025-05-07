import { useState } from "react";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface BestTimesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  time: number;
  difficulty: string;
}

export const BestTimesDialog = ({
  isOpen,
  onClose,
  onSubmit,
  time,
  difficulty,
}: BestTimesDialogProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>New Best Time!</DialogTitle>
        </DialogHeader>
        <p className="mb-2">
          You completed {difficulty} difficulty in {time} seconds!
        </p>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 15))}
            maxLength={15}
            className="mb-4"
            autoFocus
            autoComplete="off"
          />
          <DialogFooter>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={!name}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
