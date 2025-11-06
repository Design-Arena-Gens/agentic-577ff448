"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Keyboard } from "../components/Keyboard";
import { GameBoard } from "../components/GameBoard";
import { TopBar } from "../components/TopBar";
import { WORD_BANK, VALID_GUESSES } from "../data/wordlist";
import {
  MAX_ATTEMPTS,
  WORD_LENGTH,
  createEmptyBoard,
  evaluateGuess,
  isCorrectGuess,
  mergeKeyboardHints,
  previousDayDate,
  solutionForDate
} from "../lib/gameLogic";
import { loadSnapshot, loadStats, saveSnapshot, saveStats } from "../lib/storage";
import type { GameSnapshot, GuessRow, LetterEvaluation, PersistedStats } from "../lib/types";

const defaultStats: PersistedStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastPlayedIso: null,
  distribution: Array.from({ length: MAX_ATTEMPTS }, () => 0)
};

const todayKey = () => format(new Date(), "yyyy-MM-dd");

const assembleRow = (guess: string, evaluations?: LetterEvaluation[]): GuessRow => {
  const letters = Array.from({ length: WORD_LENGTH }, (_, index) => {
    const letter = guess[index] ?? "";
    const evaluation = evaluations?.[index];
    const state = evaluation?.state ?? (letter ? "empty" : "empty");
    return {
      letter: letter.toUpperCase(),
      state
    };
  });
  return { letters };
};

const updateStats = (
  stats: PersistedStats,
  won: boolean,
  guessCount: number | null
): PersistedStats => {
  const today = todayKey();
  if (stats.lastPlayedIso === today) {
    return stats;
  }

  const nextStats = { ...stats };
  nextStats.gamesPlayed += 1;
  nextStats.lastPlayedIso = today;
  if (won && guessCount) {
    nextStats.gamesWon += 1;
    nextStats.currentStreak += 1;
    nextStats.maxStreak = Math.max(nextStats.maxStreak, nextStats.currentStreak);
    if (guessCount >= 1 && guessCount <= MAX_ATTEMPTS) {
      nextStats.distribution = nextStats.distribution.map((value, index) =>
        index === guessCount - 1 ? value + 1 : value
      );
    }
  } else {
    nextStats.currentStreak = 0;
  }

  return nextStats;
};

const computeStreakMessage = (stats: PersistedStats): string | null => {
  if (!stats.currentStreak) return null;
  if (stats.currentStreak >= 10) return `${stats.currentStreak}-day neon streak — unstoppable!`;
  if (stats.currentStreak >= 5) return `On fire! ${stats.currentStreak} wins in a row.`;
  if (stats.currentStreak >= 2) return `Streak of ${stats.currentStreak}. Keep the glow alive.`;
  return null;
};

export default function Page() {
  const [board, setBoard] = useState<GuessRow[]>(createEmptyBoard);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [rowIndex, setRowIndex] = useState<number>(0);
  const [keyboardHints, setKeyboardHints] = useState<Record<string, LetterEvaluation["state"]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [didWin, setDidWin] = useState<boolean>(false);
  const [revealRow, setRevealRow] = useState<number | null>(null);
  const [stats, setStats] = useState<PersistedStats>(defaultStats);
  const [solution, setSolution] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    const word = solutionForDate(now, WORD_BANK);
    setSolution(word);

    const snapshot = loadSnapshot();
    if (snapshot && snapshot.solution === word) {
      const restoredRows = createEmptyBoard();
      let hints: Record<string, LetterEvaluation["state"]> = {};
      snapshot.guesses.forEach((guess, index) => {
        const evaluations = evaluateGuess(guess, word);
        restoredRows[index] = assembleRow(guess, evaluations);
        hints = mergeKeyboardHints(hints, evaluations);
      });
      if (!snapshot.completed) {
        const nextActiveRow = snapshot.guesses.length;
        if (nextActiveRow < MAX_ATTEMPTS) {
          restoredRows[nextActiveRow] = assembleRow(snapshot.guesses[nextActiveRow] ?? "");
        }
        setRowIndex(nextActiveRow);
        setCurrentGuess(snapshot.guesses[nextActiveRow] ?? "");
      }
      setBoard(restoredRows);
      setGameOver(snapshot.completed);
      setDidWin(snapshot.won);
      setKeyboardHints(hints);
    }

    const persistedStats = loadStats();
    if (persistedStats) {
      setStats(persistedStats);
    }
  }, []);

  const streakMessage = useMemo(() => computeStreakMessage(stats), [stats]);

  const showTemporaryMessage = useCallback((text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 2000);
  }, []);

  const persistGame = useCallback(
    (snapshot: GameSnapshot) => {
      saveSnapshot(snapshot);
    },
    []
  );

  const updateBoardForGuess = useCallback(
    (guess: string, evaluations: LetterEvaluation[]) => {
      setBoard((prev) => {
        const next = [...prev];
        next[rowIndex] = {
          letters: evaluations.map((entry) => ({
            letter: entry.letter.toUpperCase(),
            state: entry.state
          }))
        };
        return next;
      });
      setRevealRow(rowIndex);
      setTimeout(() => setRevealRow(null), 650);
    },
    [rowIndex]
  );

  const handleSubmitGuess = useCallback(() => {
    if (gameOver) return;
    if (currentGuess.length !== WORD_LENGTH) {
      showTemporaryMessage("Need five letters");
      return;
    }

    if (!VALID_GUESSES.includes(currentGuess.toLowerCase())) {
      showTemporaryMessage("Not in neon lexicon");
      return;
    }

    if (!solution) return;

    const normalizedGuess = currentGuess.toLowerCase();
    const evaluations = evaluateGuess(normalizedGuess, solution);
    updateBoardForGuess(currentGuess, evaluations);

    setKeyboardHints((prev) => mergeKeyboardHints(prev, evaluations));

    const nextSnapshot: GameSnapshot = {
      solution,
      guesses: [
        ...board
          .slice(0, rowIndex)
          .map((row) => row.letters.map((l) => l.letter).join("").toLowerCase()),
        normalizedGuess
      ],
      completed: false,
      won: false,
      lastUpdated: new Date().toISOString()
    };

    const didGuessCorrectly = isCorrectGuess(evaluations);
    const nextRow = rowIndex + 1;

    if (didGuessCorrectly) {
      setGameOver(true);
      setDidWin(true);
      showTemporaryMessage("You cracked the code!");

      const updatedStats = updateStats(stats, true, nextRow);
      setStats(updatedStats);
      saveStats(updatedStats);

      nextSnapshot.completed = true;
      nextSnapshot.won = true;
      persistGame(nextSnapshot);
      return;
    }

    if (nextRow === MAX_ATTEMPTS) {
      setGameOver(true);
      setDidWin(false);
      showTemporaryMessage(`The word was ${solution.toUpperCase()}`);

      const updatedStats = updateStats(stats, false, null);
      setStats(updatedStats);
      saveStats(updatedStats);

      nextSnapshot.completed = true;
      nextSnapshot.won = false;
      persistGame(nextSnapshot);
      return;
    }

    setRowIndex(nextRow);
    setCurrentGuess("");

    setBoard((prev) => {
      const next = [...prev];
      next[nextRow] = assembleRow("");
      return next;
    });

    persistGame(nextSnapshot);
  }, [
    board,
    currentGuess,
    gameOver,
    persistGame,
    rowIndex,
    showTemporaryMessage,
    solution,
    stats,
    updateBoardForGuess
  ]);

  const handleKey = useCallback(
    (key: string) => {
      if (gameOver) return;
      if (key === "ENTER") {
        handleSubmitGuess();
        return;
      }
      if (key === "DELETE") {
        setCurrentGuess((prev) => {
          const nextGuess = prev.slice(0, -1);
          setBoard((boardPrev) => {
            const updated = [...boardPrev];
            updated[rowIndex] = assembleRow(nextGuess);
            return updated;
          });
          return nextGuess;
        });
        return;
      }

      if (!/^[A-Z]$/.test(key)) return;

      setCurrentGuess((prev) => {
        if (prev.length >= WORD_LENGTH) return prev;
        const nextGuess = (prev + key).slice(0, WORD_LENGTH);
        setBoard((boardPrev) => {
          const updated = [...boardPrev];
          updated[rowIndex] = assembleRow(nextGuess);
          return updated;
        });
        return nextGuess;
      });
    },
    [gameOver, handleSubmitGuess, rowIndex]
  );

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const { key } = event;
      if (key === "Enter") {
        handleKey("ENTER");
      } else if (key === "Backspace") {
        handleKey("DELETE");
      } else if (/^[a-zA-Z]$/.test(key)) {
        handleKey(key.toUpperCase());
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [handleKey]);

  useEffect(() => {
    if (!solution) return;
    const snapshot = loadSnapshot();
    if (!snapshot || snapshot.solution !== solution) {
      const fresh = createEmptyBoard();
      setBoard(fresh);
      setCurrentGuess("");
      setRowIndex(0);
      setKeyboardHints({});
      setGameOver(false);
      setDidWin(false);
      persistGame({
        solution,
        guesses: [],
        completed: false,
        won: false,
        lastUpdated: new Date().toISOString()
      });
    }
  }, [persistGame, solution]);

  const shareResult = useCallback(() => {
    if (!gameOver) return;
    const rows = board.slice(0, gameOver && !didWin ? MAX_ATTEMPTS : rowIndex + (didWin ? 1 : 0));
    const emojiLines = rows
      .map((row) =>
        row.letters
          .map((letter) => {
            switch (letter.state) {
              case "correct":
                return "🟩";
              case "present":
                return "🟨";
              case "absent":
              default:
                return "⬛";
            }
          })
          .join("")
      )
      .join("\n");

    const statusLine = didWin ? `${rowIndex + 1}/${MAX_ATTEMPTS}` : "X/" + MAX_ATTEMPTS;
    const text = `Neon Word Dash ${todayKey()} ${statusLine}\n${emojiLines}\nhttps://agentic-577ff448.vercel.app`;

    if (navigator.share) {
      navigator
        .share({
          title: "Neon Word Dash",
          text
        })
        .catch(() => navigator.clipboard.writeText(text));
    } else {
      navigator.clipboard.writeText(text);
      showTemporaryMessage("Copied score to clipboard");
    }
  }, [board, didWin, gameOver, rowIndex, showTemporaryMessage]);

  const yesterdayWord = useMemo(
    () => solutionForDate(previousDayDate(new Date()), WORD_BANK).toUpperCase(),
    []
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-16">
      <TopBar stats={stats} streakMessage={streakMessage} />
      {message ? (
        <div className="mx-auto mb-4 rounded-full bg-[#1c1c30] px-4 py-2 text-sm text-accent shadow-lg">
          {message}
        </div>
      ) : null}

      <GameBoard rows={board} revealRowIndex={revealRow} />

      <div className="mt-6 text-center text-xs text-[#7c7c95]">
        Yesterday&apos;s word: <span className="text-foreground">{yesterdayWord}</span>
      </div>

      <Keyboard letterStates={keyboardHints} onKeyPress={handleKey} />

      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        {gameOver ? (
          <>
            <p className="text-sm text-[#9c9cb8]">
              {didWin ? "Legendary! You solved it." : `Out of tries. The word was ${solution.toUpperCase()}.`}
            </p>
            <button
              type="button"
              onClick={shareResult}
              className="rounded-full bg-accent px-6 py-2 text-sm font-semibold uppercase tracking-wide text-background shadow-lg transition hover:brightness-110"
            >
              Share Neon Grid
            </button>
          </>
        ) : null}
        <p className="text-xs text-[#5f5f75]">Midnight refresh in your local timezone.</p>
      </div>
    </main>
  );
}
