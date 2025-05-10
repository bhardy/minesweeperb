import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { LATEST_USERNAME_KEY } from "@/types/constants";
import useLocalStorage from "use-local-storage";

interface NewBestTimeProps {
  isOpen: boolean;
  onSubmit: (name: string) => void;
  onClose: () => void;
  time: number;
  difficulty: string;
  seed?: string;
}

export const NewBestTime = ({
  isOpen,
  onSubmit,
  onClose,
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
        <DialogDescription>
          {seed ? (
            <span className="text-black">
              You completed seed <b>{seed}</b> on <b>{difficulty}</b> difficulty{" "}
              in <b>{time}</b> seconds!
            </span>
          ) : (
            <span className="text-black">
              You completed <b>{difficulty}</b> difficulty in <b>{time}</b>{" "}
              seconds!
            </span>
          )}
        </DialogDescription>
        {seed ? (
          <p className="text-gray-500 text-sm">
            Best times from seeded rounds are not saved
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="record-holder" className="mb-2">
                  Your name
                </Label>
                <Input
                  id="record-holder"
                  type="text"
                  name="recordHolder"
                  placeholder="Enter your name"
                  value={name ?? ""}
                  onChange={(e) => setName(e.target.value.slice(0, 15))}
                  maxLength={15}
                  autoFocus
                  autoComplete="off"
                />
              </div>
              <Button type="submit" disabled={!name?.trim()}>
                Save
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
