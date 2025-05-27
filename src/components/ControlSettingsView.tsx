import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useStore, CellAction } from "@/store";
import classNames from "classnames";

interface ActionSelectProps {
  label: string;
  value: CellAction;
  onChange: (value: CellAction) => void;
  options: CellAction[];
  isBasicMode: boolean;
}

function ActionSelect({
  label,
  value,
  onChange,
  options,
  isBasicMode,
}: ActionSelectProps) {
  // Don't render if we're in basic mode and the action is "none"
  if (isBasicMode && value === "none") {
    return null;
  }

  return (
    <div className="flex items-center justify-between py-2">
      <Label
        className={classNames("text-sm", {
          "text-muted-foreground": isBasicMode,
        })}
      >
        {label}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={isBasicMode}>
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
}

export function ControlSettingsView() {
  const {
    gameSettings,
    updateUnrevealedCellSetting,
    updateRevealedCellSetting,
  } = useStore();

  const isBasicMode = gameSettings.controlMode === "basic";

  return (
    <>
      <Separator className="my-4" />
      <h4
        className={classNames("text-sm font-bold my-4", {
          "text-muted-foreground": isBasicMode,
        })}
      >
        Unrevealed Cells
      </h4>
      <ActionSelect
        label="Left Click / Tap"
        value={gameSettings.unrevealedCells.leftClick}
        onChange={(value) => updateUnrevealedCellSetting("leftClick", value)}
        options={["reveal", "flag", "none"]}
        isBasicMode={isBasicMode}
      />
      <ActionSelect
        label="Right Click"
        value={gameSettings.unrevealedCells.rightClick}
        onChange={(value) => updateUnrevealedCellSetting("rightClick", value)}
        options={["reveal", "flag", "none"]}
        isBasicMode={isBasicMode}
      />
      <ActionSelect
        label="Left + Right Click"
        value={gameSettings.unrevealedCells.leftRightClick}
        onChange={(value) =>
          updateUnrevealedCellSetting("leftRightClick", value)
        }
        options={["reveal", "flag", "none"]}
        isBasicMode={isBasicMode}
      />
      <ActionSelect
        label="Hold"
        value={gameSettings.unrevealedCells.hold}
        onChange={(value) => updateUnrevealedCellSetting("hold", value)}
        options={["reveal", "flag", "none"]}
        isBasicMode={isBasicMode}
      />

      <Separator className="my-4" />
      <h4
        className={classNames("text-sm font-bold my-4", {
          "text-muted-foreground": isBasicMode,
        })}
      >
        Revealed Cells
      </h4>
      <ActionSelect
        label="Left Click / Tap"
        value={gameSettings.revealedCells.leftClick}
        onChange={(value) => updateRevealedCellSetting("leftClick", value)}
        options={["quick-reveal", "none"]}
        isBasicMode={isBasicMode}
      />
      <ActionSelect
        label="Right Click"
        value={gameSettings.revealedCells.rightClick}
        onChange={(value) => updateRevealedCellSetting("rightClick", value)}
        options={["quick-reveal", "none"]}
        isBasicMode={isBasicMode}
      />
      <ActionSelect
        label="Left + Right Click"
        value={gameSettings.revealedCells.leftRightClick}
        onChange={(value) => updateRevealedCellSetting("leftRightClick", value)}
        options={["quick-reveal", "none"]}
        isBasicMode={isBasicMode}
      />
      <ActionSelect
        label="Hold"
        value={gameSettings.revealedCells.hold}
        onChange={(value) => updateRevealedCellSetting("hold", value)}
        options={["quick-reveal", "none"]}
        isBasicMode={isBasicMode}
      />
    </>
  );
}
