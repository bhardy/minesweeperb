"use client";

import { Minesweeper } from "@/components/Minesweeper/Minesweeper";
import { format, parse } from "date-fns";

export function DailyGame({ date }: { date: string }) {
  // Convert the date string (e.g., "may-11-25") to a Date object
  const dateObj = parse(date, "MMMM-d-yy", new Date());

  // Use the date as a seed for the game
  const seed = format(dateObj, "yyyy-MM-dd");

  // Save game result to localStorage when game ends
  const handleGameEnd = (status: "won" | "lost") => {
    const results = JSON.parse(
      localStorage.getItem("dailyChallengeResults") || "{}"
    );
    results[date] = status;
    localStorage.setItem("dailyChallengeResults", JSON.stringify(results));
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-center my-4">
        Daily Challenge: {format(date, "MMMM d, yyyy")}
      </h1>
      <Minesweeper seed={seed} onGameEnd={handleGameEnd} />
    </>
  );
}
