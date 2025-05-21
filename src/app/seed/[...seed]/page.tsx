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
    <main className="flex flex-col flex-1 font-[family-name:var(--font-geist-sans)]">
      <Suspense>
        <Minesweeper seed={seed[0]} />
      </Suspense>
    </main>
  );
}
