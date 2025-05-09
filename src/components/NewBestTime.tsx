import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { LATEST_USERNAME_KEY } from "@/types/constants";
import useLocalStorage from "use-local-storage";

interface NewBestTimeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  time: number;
  difficulty: string;
  seed?: string;
}

export const NewBestTime = ({
  isOpen,
  onClose,
  onSubmit,
  time,
  difficulty,
  seed,
}: NewBestTimeProps) => {
  const [name, setName] = useLocalStorage(LATEST_USERNAME_KEY, "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name?.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{seed ? "You Won!" : "New Best Time!"}</DialogTitle>
        </DialogHeader>
        {seed ? (
          <>
            <p>
              You completed seed <b>{seed}</b> on <b>{difficulty}</b> difficulty{" "}
              in <b>{time}</b> seconds!
            </p>
            <p className="text-gray-500 text-sm text-center">
              Best times from seeded rounds are not saved
            </p>
          </>
        ) : (
          <>
            <p className="mb-2">
              You completed <b>{difficulty}</b> difficulty in <b>{time}</b>{" "}
              seconds!
            </p>
            <form onSubmit={handleSubmit}>
              <Label htmlFor="user-name" className="mb-2">
                Your name
              </Label>
              <Input
                id="user-name"
                type="text"
                placeholder="Enter your name"
                value={name ?? ""}
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
                <Button type="submit" disabled={!name?.trim()}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
