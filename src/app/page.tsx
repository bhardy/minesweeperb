import { Minesweeper } from "@/components/Minesweeper/Minesweeper";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="flex flex-col flex-1 font-[family-name:var(--font-geist-sans)]">
      <Suspense>
        <Minesweeper />
      </Suspense>
    </main>
  );
}
