import { Minesweeper } from "@/components/Minesweeper/Minesweeper";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Suspense>
        <Minesweeper />
      </Suspense>
    </main>
  );
}
