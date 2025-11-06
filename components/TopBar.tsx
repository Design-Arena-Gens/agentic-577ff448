"use client";

import { useState } from "react";
import { StatsModal } from "./modals/StatsModal";
import { HelpModal } from "./modals/HelpModal";
import type { PersistedStats } from "../lib/types";

interface TopBarProps {
  stats: PersistedStats;
  streakMessage: string | null;
}

export function TopBar({ stats, streakMessage }: TopBarProps) {
  const [isStatsOpen, setStatsOpen] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);

  return (
    <header className="flex flex-col items-center gap-3 py-6 text-center">
      <div className="flex w-full items-center justify-between">
        <button
          className="rounded-full border border-[#2a2a3c] px-3 py-1 text-sm font-medium uppercase tracking-wide text-foreground transition hover:border-accent hover:text-accent"
          type="button"
          onClick={() => setHelpOpen(true)}
        >
          How To Play
        </button>
        <h1 className="text-2xl font-semibold text-foreground">Neon Word Dash</h1>
        <button
          className="rounded-full border border-[#2a2a3c] px-3 py-1 text-sm font-medium uppercase tracking-wide text-foreground transition hover:border-accent hover:text-accent"
          type="button"
          onClick={() => setStatsOpen(true)}
        >
          Stats
        </button>
      </div>
      {streakMessage ? (
        <p className="text-sm text-accent">{streakMessage}</p>
      ) : null}

      <StatsModal open={isStatsOpen} onClose={() => setStatsOpen(false)} stats={stats} />
      <HelpModal open={isHelpOpen} onClose={() => setHelpOpen(false)} />
    </header>
  );
}
