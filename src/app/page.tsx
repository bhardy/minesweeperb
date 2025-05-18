import { Minesweeper } from "@/components/Minesweeper/Minesweeper";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="flex flex-col flex-1 font-[family-name:var(--font-geist-sans)]">
      <Suspense>
        {/* <div className="flex flex-1 items-center p-4 border-red-500 border-2 overflow-auto"> */}
        <Minesweeper />
        {/* </div> */}
      </Suspense>
    </main>
  );
}
