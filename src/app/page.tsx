import { Minesweeper } from "@/components/Minesweeper";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen font-[family-name:var(--font-geist-sans)] bg-gray-900">
      <Minesweeper />
    </main>
  );
}
