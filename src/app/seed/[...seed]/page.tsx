import { Minesweeper } from "@/components/Minesweeper/Minesweeper";
import { Suspense } from "react";

type Props = {
  params: Promise<{
    seed: string;
  }>;
};

export default async function Seed({ params }: Props) {
  const { seed } = await params;

  return (
    <main className="flex min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Suspense>
        <div className="flex flex-1 self-center p-4">
          <Minesweeper seed={seed[0]} />
        </div>
      </Suspense>
    </main>
  );
}
