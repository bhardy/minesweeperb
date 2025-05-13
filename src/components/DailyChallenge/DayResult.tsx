import type { AllResults } from "@/types/minesweeper";
import Link from "next/link";
import classNames from "classnames";

interface DayResultProps {
  results: AllResults;
  date: string;
}

export const DayResult = ({ results, date }: DayResultProps) => {
  const difficulties = ["beginner", "intermediate", "expert"];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">Daily Challenge</h3>
      <div className="grid grid-cols-3 gap-2">
        {difficulties.map((difficulty) => {
          const result = results[difficulty as keyof AllResults]?.[date];
          return (
            <Link
              key={difficulty}
              href={`/daily/${date}/${difficulty}`}
              className={classNames(
                "aspect-square rounded-lg p-4 flex flex-col items-center justify-center text-sm transition-colors",
                {
                  "bg-green-500 hover:bg-green-600 text-white":
                    result?.status === "won",
                  "bg-blue-500 hover:bg-blue-600 text-white":
                    result?.status === "won-retry",
                  "bg-red-500 hover:bg-red-600 text-white":
                    result?.status === "lost",
                  "bg-gray-50 hover:bg-gray-100 text-black": !result,
                }
              )}
            >
              <span className="capitalize font-semibold mb-2">
                {difficulty}
              </span>
              {(result?.status === "won" || result?.status === "won-retry") && (
                <span>{result.time}s</span>
              )}
              {result?.status === "lost" && <span>Retry</span>}
              {!result && <span>Play</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
