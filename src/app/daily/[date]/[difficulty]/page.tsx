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
    <main className="flex min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Suspense>
        <div className="flex flex-1 self-center p-4">
          <DailyGame date={date} difficulty={difficulty} />
        </div>
      </Suspense>
    </main>
  );
}
