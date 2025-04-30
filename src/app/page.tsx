import { Minesweeper } from "@/components/Minesweeper";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen font-[family-name:var(--font-geist-sans)] bg-gray-900">
      <Suspense>
        <Minesweeper />
      </Suspense>
    </main>
  );
}
