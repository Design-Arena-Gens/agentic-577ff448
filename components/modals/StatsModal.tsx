"use client";

import { useMemo } from "react";
import type { PersistedStats } from "../../lib/types";
import { ModalShell } from "./ModalShell";

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
  stats: PersistedStats;
}

const toPercent = (value: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export function StatsModal({ open, onClose, stats }: StatsModalProps) {
  const totalGuesses = useMemo(
    () => stats.distribution.reduce((sum, value) => sum + value, 0),
    [stats.distribution]
  );

  return (
    <ModalShell open={open} onClose={onClose} title="Your Stats">
      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-3xl font-semibold text-foreground">{stats.gamesPlayed}</p>
          <p className="text-xs uppercase tracking-wide text-[#9c9cb8]">Games</p>
        </div>
        <div>
          <p className="text-3xl font-semibold text-foreground">
            {stats.gamesPlayed ? toPercent(stats.gamesWon, stats.gamesPlayed) : 0}
          </p>
          <p className="text-xs uppercase tracking-wide text-[#9c9cb8]">Win %</p>
        </div>
        <div>
          <p className="text-3xl font-semibold text-foreground">{stats.currentStreak}</p>
          <p className="text-xs uppercase tracking-wide text-[#9c9cb8]">Streak</p>
        </div>
        <div>
          <p className="text-3xl font-semibold text-foreground">{stats.maxStreak}</p>
          <p className="text-xs uppercase tracking-wide text-[#9c9cb8]">Best</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#9c9cb8]">Guess Distribution</h3>
        <div className="mt-2 space-y-2">
          {stats.distribution.map((value, index) => {
            const percent = toPercent(value, totalGuesses);
            return (
              <div key={index} className="flex items-center gap-2 text-xs uppercase text-[#9c9cb8]">
                <span className="w-4 text-center text-[#7c7c95]">{index + 1}</span>
                <div className="h-6 flex-1 rounded bg-[#1c1c30]">
                  <div
                    className="flex h-full items-center justify-end rounded bg-accent px-2 font-semibold text-background"
                    style={{ width: `${Math.max(percent, value > 0 ? 20 : 5)}%` }}
                  >
                    {value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ModalShell>
  );
}
