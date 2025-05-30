"use client";

import { TutorialStep } from "@/components/Minesweeper/TutorialStep";

export default function Tutorial() {
  return (
    <main className="flex flex-col flex-1 font-[family-name:var(--font-geist-sans)] p-4">
      <TutorialStep />
    </main>
  );
}
