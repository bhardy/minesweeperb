import { DailyGame } from "@/components/DailyChallenge/DailyGame";
import { Suspense, use } from "react";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    date: string;
    difficulty: string;
  }>;
};

export default function Date({ params }: Props) {
  const { date, difficulty } = use(params);

  // Validate difficulty
  if (!["beginner", "intermediate", "expert"].includes(difficulty)) {
    notFound();
  }

  return (
    <main className="flex flex-col flex-1 font-[family-name:var(--font-geist-sans)]">
      <Suspense>
        <DailyGame date={date} difficulty={difficulty} />
      </Suspense>
    </main>
  );
}
