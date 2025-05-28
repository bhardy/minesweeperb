"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter, usePathname } from "next/navigation";
import { useMediaQuery } from "@react-hook/media-query";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSub,
  MenubarSubTrigger,
  MenubarPortal,
  MenubarSubContent,
} from "@/components/ui/menubar";
import { DIFFICULTY_LEVELS, GAME_MODES } from "@/types/constants";
import { RecordsDialog } from "./RecordsDialog";
import { SettingsDialog } from "./SettingsDialog";
import { ArchiveDialog } from "./DailyChallenge/ArchiveDialog";
import { DailyStatusDialog } from "./DailyChallenge/DailyStatusDialog";
import type { GameSettings } from "@/store";

interface OptionsProps {
  currentDifficulty: number;
  setDifficulty: (difficulty: number) => void;
  gameSettings: GameSettings;
  setQuickFlagMode: (mode: boolean) => void;
}

export function Options({
  currentDifficulty,
  setDifficulty,
  gameSettings,
  setQuickFlagMode,
}: OptionsProps) {
  const [recordsOpen, setRecordsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [dailyStatusOpen, setDailyStatusOpen] = useState(false);
  const isTouchDevice = useMediaQuery("(pointer: coarse)");

  const router = useRouter();
  const pathname = usePathname();

  const currentGameMode = pathname?.includes("daily")
    ? "daily"
    : pathname?.includes("tutorial")
    ? "tutorial"
    : "classic";

  const formattedDate = format(new Date(), "MMMM-d-yy").toLowerCase();

  return (
    <>
      <Menubar className="border-none bg-transparent p-0 h-auto shadow-none">
        <MenubarMenu>
          <MenubarTrigger className="text-xs px-0 py-1 h-auto cursor-pointer hover:bg-transparent dark:hover:bg-transparent hover:underline dark:text-foreground focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:underline focus:underline">
            Game
          </MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Select Difficulty</MenubarLabel>
            <MenubarRadioGroup
              value={currentDifficulty.toString()}
              onValueChange={(value) => setDifficulty(parseInt(value))}
            >
              {DIFFICULTY_LEVELS.map((level, index) => (
                <MenubarRadioItem key={level.name} value={index.toString()}>
                  {level.name.charAt(0).toUpperCase() + level.name.slice(1)}
                </MenubarRadioItem>
              ))}
            </MenubarRadioGroup>
            {isTouchDevice && (
              <>
                <MenubarSeparator />
                <MenubarLabel>Flag Mode</MenubarLabel>
                {gameSettings.controlMode === "custom" ? (
                  <MenubarLabel className="text-xs text-muted-foreground">
                    Disabled while using Custom Controls
                  </MenubarLabel>
                ) : (
                  <MenubarRadioGroup
                    value={gameSettings.quickFlagMode ? "quick" : "normal"}
                    onValueChange={(value) =>
                      setQuickFlagMode(value === "quick")
                    }
                  >
                    <MenubarRadioItem value="normal">Normal</MenubarRadioItem>
                    <MenubarRadioItem value="quick">
                      Quick Flag
                    </MenubarRadioItem>
                  </MenubarRadioGroup>
                )}
              </>
            )}
            <MenubarSeparator />
            <MenubarLabel>Game Mode</MenubarLabel>
            <MenubarRadioGroup
              value={currentGameMode}
              onValueChange={(value) => {
                if (value === "daily") {
                  router.push(
                    `/daily/${formattedDate}/${DIFFICULTY_LEVELS[currentDifficulty].name}`
                  );
                } else if (value === "tutorial") {
                  router.push("/tutorial");
                } else {
                  router.push("/");
                }
              }}
            >
              {GAME_MODES.map((mode) => (
                <MenubarRadioItem key={mode.name} value={mode.value}>
                  {mode.name}
                </MenubarRadioItem>
              ))}
            </MenubarRadioGroup>
            <MenubarSeparator />
            {currentGameMode === "daily" && (
              <>
                <MenubarSub>
                  <MenubarSubTrigger>Daily Status</MenubarSubTrigger>
                  <MenubarPortal>
                    <MenubarSubContent>
                      <MenubarItem onSelect={() => setDailyStatusOpen(true)}>
                        Challenges for {format(new Date(), "MMMM do")}
                      </MenubarItem>
                      <MenubarItem onSelect={() => setArchiveOpen(true)}>
                        Daily Challenge Archive
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarPortal>
                </MenubarSub>
                <MenubarSeparator />
              </>
            )}
            {currentGameMode === "classic" && (
              <MenubarItem onSelect={() => setRecordsOpen(true)}>
                View Best Times
              </MenubarItem>
            )}
            <MenubarItem onSelect={() => setSettingsOpen(true)}>
              Settings
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      {recordsOpen && (
        <RecordsDialog isOpen={true} onClose={() => setRecordsOpen(false)} />
      )}
      {settingsOpen && (
        <SettingsDialog isOpen={true} onClose={() => setSettingsOpen(false)} />
      )}
      {dailyStatusOpen && (
        <DailyStatusDialog
          date={formattedDate}
          isOpen={true}
          onClose={() => setDailyStatusOpen(false)}
        />
      )}
      {archiveOpen && (
        <ArchiveDialog isOpen={true} onClose={() => setArchiveOpen(false)} />
      )}
    </>
  );
}
