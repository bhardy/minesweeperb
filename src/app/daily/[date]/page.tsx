import { DailyGame } from "@/components/DailyChallenge/DailyGame";
import { Suspense } from "react";

type Props = {
  params: Promise<{
    date: string;
  }>;
};

export default async function Date({ params }: Props) {
  const { date } = await params;

  console.log(date);

  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Suspense>
        <DailyGame date={date} />
      </Suspense>
    </main>
  );
}
