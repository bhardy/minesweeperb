"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Level } from "@/types/minesweeper";

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-none p-2">
          Game
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
