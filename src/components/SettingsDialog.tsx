import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStore, CellAction } from "@/store";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const {
    gameSettings,
    updateUnrevealedCellSetting,
    updateRevealedCellSetting,
  } = useStore();

  const renderActionSelect = (
    label: string,
    value: CellAction,
    onChange: (value: CellAction) => void,
    options: CellAction[]
  ) => (
    <div className="flex items-center justify-between py-2">
      <Label className="text-sm">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
          <DialogDescription>
            Customize your mindsweeping experience. Choose your ideal
            appearance. Fine-tune your button functionality.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-md font-medium mb-1">Appearance</h3>
            <div className="flex items-center justify-between py-2">
              <Label className="text-sm">Theme</Label>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-md font-medium mb-4">Controls</h3>
            <p className="text-sm font-normal my-4">
              You can completely customize what action is fired when you click,
              right click, left + right click, or hold on a cell. Revealed cells
              and Unrevealed cells can be tuned to behave differently.
            </p>
            <Separator className="my-4" />
            <h4 className="text-sm font-bold my-4">Unrevealed Cells</h4>
            {renderActionSelect(
              "Left Click / Tap",
              gameSettings.unrevealedCells.leftClick,
              (value) => updateUnrevealedCellSetting("leftClick", value),
              ["reveal", "flag", "none"]
            )}
            {renderActionSelect(
              "Right Click",
              gameSettings.unrevealedCells.rightClick,
              (value) => updateUnrevealedCellSetting("rightClick", value),
              ["reveal", "flag", "none"]
            )}
            {renderActionSelect(
              "Left + Right Click",
              gameSettings.unrevealedCells.leftRightClick,
              (value) => updateUnrevealedCellSetting("leftRightClick", value),
              ["reveal", "flag", "none"]
            )}
            {renderActionSelect(
              "Hold",
              gameSettings.unrevealedCells.hold,
              (value) => updateUnrevealedCellSetting("hold", value),
              ["reveal", "flag", "none"]
            )}

            <Separator className="my-4" />
            <h4 className="text-sm font-bold my-4">Revealed Cells</h4>
            {renderActionSelect(
              "Left Click / Tap",
              gameSettings.revealedCells.leftClick,
              (value) => updateRevealedCellSetting("leftClick", value),
              ["quick-reveal", "none"]
            )}
            {renderActionSelect(
              "Right Click",
              gameSettings.revealedCells.rightClick,
              (value) => updateRevealedCellSetting("rightClick", value),
              ["quick-reveal", "none"]
            )}
            {renderActionSelect(
              "Left + Right Click",
              gameSettings.revealedCells.leftRightClick,
              (value) => updateRevealedCellSetting("leftRightClick", value),
              ["quick-reveal", "none"]
            )}
            {renderActionSelect(
              "Hold",
              gameSettings.revealedCells.hold,
              (value) => updateRevealedCellSetting("hold", value),
              ["quick-reveal", "none"]
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
