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
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Suspense>
        <Minesweeper seed={seed[0]} />
      </Suspense>
    </main>
  );
}
