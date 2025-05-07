"use client";

import * as React from "react";

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
} from "@/components/ui/dropdown-menu";
import type { Level } from "@/types/minesweeper";
import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";
import { RecordsDialog } from "./RecordsDialog";

interface OptionsProps {
  difficultyLevels: Level[];
  currentDifficulty: number;
  setDifficulty: (difficulty: number) => void;
}

export function Options({
  difficultyLevels,
  currentDifficulty,
  setDifficulty,
}: OptionsProps) {
  const [recordsOpen, setRecordsOpen] = React.useState(false);

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
              View Records
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {recordsOpen && (
        <RecordsDialog isOpen={true} onClose={() => setRecordsOpen(false)} />
      )}
    </>
  );
}
