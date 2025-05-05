import { Minesweeper } from "@/components/Minesweeper";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="p-4 items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Suspense>
        <Minesweeper />
      </Suspense>
    </main>
  );
}
