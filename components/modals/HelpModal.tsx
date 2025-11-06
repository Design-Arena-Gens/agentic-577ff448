"use client";

import { ModalShell } from "./ModalShell";

const exampleRow = (letters: { letter: string; state: "correct" | "present" | "absent" }[]) => (
  <div className="grid grid-cols-5 gap-2">
    {letters.map(({ letter, state }) => (
      <div
        key={letter}
        className={`aspect-square w-full rounded-lg border text-center text-xl font-bold uppercase tracking-wider flex items-center justify-center ${
          state === "correct"
            ? "bg-success text-background"
            : state === "present"
              ? "bg-warning text-background"
              : "bg-[#2a2a3c] text-foreground"
        }`}
      >
        {letter}
      </div>
    ))}
  </div>
);

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <ModalShell open={open} onClose={onClose} title="How to Play">
      <p>
        Guess the hidden five-letter word in six attempts. Each guess must be a valid word. After each guess the color of the tiles will change to show how close your guess was to the solution.
      </p>
      <div className="space-y-2">
        <p className="font-semibold text-foreground">Examples</p>
        {exampleRow([
          { letter: "V", state: "correct" },
          { letter: "I", state: "absent" },
          { letter: "B", state: "absent" },
          { letter: "E", state: "absent" },
          { letter: "S", state: "absent" }
        ])}
        <p className="text-xs text-[#9c9cb8]">V is in the word and in the correct spot.</p>

        {exampleRow([
          { letter: "P", state: "absent" },
          { letter: "U", state: "present" },
          { letter: "L", state: "absent" },
          { letter: "S", state: "absent" },
          { letter: "E", state: "absent" }
        ])}
        <p className="text-xs text-[#9c9cb8]">U is in the word but in a different spot.</p>

        {exampleRow([
          { letter: "T", state: "absent" },
          { letter: "R", state: "absent" },
          { letter: "E", state: "absent" },
          { letter: "N", state: "absent" },
          { letter: "D", state: "absent" }
        ])}
        <p className="text-xs text-[#9c9cb8]">None of these letters are in the solution.</p>
      </div>
      <p className="text-xs text-[#9c9cb8]">
        A new puzzle drops every midnight. Build your streaks and share your neon scorecard with friends!
      </p>
    </ModalShell>
  );
}
