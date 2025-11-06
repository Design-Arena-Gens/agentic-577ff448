"use client";

import clsx from "clsx";
import type { LetterState } from "../lib/types";

const TOP_ROW = "QWERTYUIOP".split("");
const MIDDLE_ROW = "ASDFGHJKL".split("");
const BOTTOM_ROW = ["ENTER", ..."ZXCVBNM".split(""), "DELETE"];

const stateClasses: Record<LetterState, string> = {
  correct: "bg-success text-background",
  present: "bg-warning text-background",
  absent: "bg-[#2a2a3c] text-foreground",
  empty: "bg-[#1b1b29] text-foreground border border-[#2a2a3c]"
};

interface KeyboardProps {
  letterStates: Record<string, LetterState>;
  onKeyPress: (value: string) => void;
}

const KeyboardRow = ({
  letters,
  letterStates,
  onKeyPress
}: {
  letters: string[];
  letterStates: Record<string, LetterState>;
  onKeyPress: (value: string) => void;
}) => (
  <div className="flex justify-center gap-2">
    {letters.map((key) => {
      const state = letterStates[key] ?? "empty";
      const widthClass = key.length > 1 ? "px-4" : "px-2";
      return (
        <button
          key={key}
          type="button"
          className={clsx(
            "rounded-md py-3 text-sm font-semibold uppercase transition-transform duration-150 active:scale-95",
            stateClasses[state],
            widthClass
          )}
          onClick={() => onKeyPress(key)}
        >
          {key === "DELETE" ? "⌫" : key}
        </button>
      );
    })}
  </div>
);

export function Keyboard({ letterStates, onKeyPress }: KeyboardProps) {
  return (
    <div className="mt-6 flex flex-col gap-2">
      <KeyboardRow letters={TOP_ROW} letterStates={letterStates} onKeyPress={onKeyPress} />
      <KeyboardRow letters={MIDDLE_ROW} letterStates={letterStates} onKeyPress={onKeyPress} />
      <KeyboardRow letters={BOTTOM_ROW} letterStates={letterStates} onKeyPress={onKeyPress} />
    </div>
  );
}
