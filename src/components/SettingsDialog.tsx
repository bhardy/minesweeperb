import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStore } from "@/store";
import { ControlModeSettings } from "./ControlModeSettings";
import { ControlSettingsView } from "./ControlSettingsView";
import { useMedia } from "react-use";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { gameSettings } = useStore();
  const isTouchDevice = useMedia("(pointer: coarse)");

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
            <div className="mb-4">
              <ControlModeSettings />
            </div>
            {gameSettings.controlMode === "basic" ? (
              <>
                <p className="text-sm font-normal my-4">
                  Minesweeperb has automatically detected that you&apos;re using
                  a {isTouchDevice ? "touch device" : "mouse"} and applied the
                  following settings.
                </p>
                <ControlSettingsView />
              </>
            ) : (
              <>
                <p className="text-sm font-normal my-4">
                  Customize what action is fired when you click, right click,
                  left + right click, or hold on revealed and/or unrevealed
                  cells.
                </p>
                <ControlSettingsView />
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
