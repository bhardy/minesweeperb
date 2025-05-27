import { useStore } from "@/store";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

export function ControlModeSettings() {
  const { gameSettings, setControlMode, resetToDefaultSettings } = useStore();

  const handleControlModeChange = (checked: boolean) => {
    const newMode = checked ? "custom" : "basic";
    setControlMode(newMode);

    // If switching to basic mode, reset to default settings
    if (newMode === "basic") {
      resetToDefaultSettings();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="control-mode"
        checked={gameSettings.controlMode === "custom"}
        onCheckedChange={handleControlModeChange}
      />
      <Label htmlFor="control-mode">Custom Controls</Label>
    </div>
  );
}
