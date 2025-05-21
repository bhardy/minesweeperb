"use client";

import * as React from "react";
import { format } from "date-fns";
import { useRouter, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { DIFFICULTY_LEVELS, GAME_MODES } from "@/types/constants";
import { RecordsDialog } from "./RecordsDialog";
import { SettingsDialog } from "./SettingsDialog";
import { ArchiveDialog } from "./DailyChallenge/ArchiveDialog";
import { DailyStatusDialog } from "./DailyChallenge/DailyStatusDialog";

interface OptionsProps {
  currentDifficulty: number;
  setDifficulty: (difficulty: number) => void;
}

export function Options({ currentDifficulty, setDifficulty }: OptionsProps) {
  const [recordsOpen, setRecordsOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const [dailyStatusOpen, setDailyStatusOpen] = React.useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const currentGameMode = pathname?.includes("daily") ? "daily" : "classic";

  const formattedDate = format(new Date(), "MMMM-d-yy").toLowerCase();

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="block text-xs p-0 h-auto cursor-pointer first-letter:underline hover:bg-transparent dark:hover:bg-transparent hover:underline dark:text-foreground"
          >
            Game
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuLabel>Select Difficulty</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={currentDifficulty.toString()}
            onValueChange={(value) => setDifficulty(parseInt(value))}
          >
            {DIFFICULTY_LEVELS.map((level, index) => (
              <DropdownMenuRadioItem key={level.name} value={index.toString()}>
                {level.name.charAt(0).toUpperCase() + level.name.slice(1)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Game Mode</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={currentGameMode}
            onValueChange={(value) => {
              if (value === "daily") {
                router.push(
                  `/daily/${formattedDate}/${DIFFICULTY_LEVELS[currentDifficulty].name}`
                );
              } else {
                router.push("/");
              }
            }}
          >
            {GAME_MODES.map((mode) => (
              <DropdownMenuRadioItem key={mode.name} value={mode.value}>
                {mode.name.charAt(0).toUpperCase() + mode.name.slice(1)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          {currentGameMode === "daily" && (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Daily Status</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onSelect={() => setDailyStatusOpen(true)}>
                      Challenges for {format(new Date(), "MMMM do")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setArchiveOpen(true)}>
                      Daily Challenge Archive
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuGroup>
            {currentGameMode === "classic" && (
              <DropdownMenuItem onSelect={() => setRecordsOpen(true)}>
                View Best Times
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
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
