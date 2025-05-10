import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  holdToFlag: boolean;
  onHoldToFlagChange: (enabled: boolean) => void;
}

export function SettingsDialog({
  isOpen,
  onClose,
  holdToFlag,
  onHoldToFlagChange,
}: SettingsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Customize your mindsweeping experience
        </DialogDescription>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="hold-to-flag">
            Enable &apos;hold-to-flag&apos; mode
          </Label>
          <Switch
            id="hold-to-flag"
            checked={holdToFlag}
            onCheckedChange={onHoldToFlagChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
