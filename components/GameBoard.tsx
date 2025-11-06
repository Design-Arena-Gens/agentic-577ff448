"use client";

import clsx from "clsx";
import type { GuessRow, LetterEvaluation, LetterState } from "../lib/types";

const stateClasses: Record<LetterState, string> = {
  correct: "border-transparent bg-success text-background",
  present: "border-transparent bg-warning text-background",
  absent: "border-transparent bg-[#2a2a3c] text-foreground",
  empty: "border border-[#303045] text-foreground"
};

interface GameBoardProps {
  rows: GuessRow[];
  revealRowIndex: number | null;
}

export function GameBoard({ rows, revealRowIndex }: GameBoardProps) {
  return (
    <div className="mx-auto grid max-w-md gap-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-5 gap-2">
          {row.letters.map((evaluation: LetterEvaluation, tileIndex: number) => {
            const shouldReveal = rowIndex === revealRowIndex;
            return (
              <div
                key={`${rowIndex}-${tileIndex}`}
                className={clsx(
                  "aspect-square w-full rounded-lg border text-center text-3xl font-bold uppercase tracking-wider",
                  "flex items-center justify-center transition-all duration-500",
                  stateClasses[evaluation.state],
                  shouldReveal ? "animate-[flip_650ms_ease]" : ""
                )}
              >
                {evaluation.letter}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
