"use client";

import * as React from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

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
import type { Level } from "@/types/minesweeper";
import { RecordsDialog } from "./RecordsDialog";
import { SettingsDialog } from "./SettingsDialog";
import { ArchiveDialog } from "./DailyChallenge/ArchiveDialog";

interface OptionsProps {
  difficultyLevels: Level[];
  currentDifficulty: number;
  setDifficulty: (difficulty: number) => void;
  holdToFlag: boolean;
  onHoldToFlagChange: (enabled: boolean) => void;
}

export function Options({
  difficultyLevels,
  currentDifficulty,
  setDifficulty,
  holdToFlag,
  onHoldToFlagChange,
}: OptionsProps) {
  const [recordsOpen, setRecordsOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const router = useRouter();

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none p-2 text-xs"
          >
            Game
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuLabel>Select Difficulty</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={currentDifficulty.toString()}
            onValueChange={(value) => setDifficulty(parseInt(value))}
          >
            {difficultyLevels.map((level, index) => (
              <DropdownMenuRadioItem key={level.name} value={index.toString()}>
                {level.name.charAt(0).toUpperCase() + level.name.slice(1)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setRecordsOpen(true)}>
              View Best Times
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Daily Challenge</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onSelect={() =>
                    router.push(
                      `/daily/${format(new Date(), "MMMM-d-yy").toLowerCase()}`
                    )
                  }
                >
                  Today&apos;s Challenge
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setArchiveOpen(true)}>
                  View Archive
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      {recordsOpen && (
        <RecordsDialog isOpen={true} onClose={() => setRecordsOpen(false)} />
      )}
      {settingsOpen && (
        <SettingsDialog
          isOpen={true}
          onClose={() => setSettingsOpen(false)}
          holdToFlag={holdToFlag}
          onHoldToFlagChange={onHoldToFlagChange}
        />
      )}
      {archiveOpen && (
        <ArchiveDialog isOpen={true} onClose={() => setArchiveOpen(false)} />
      )}
    </>
  );
}
