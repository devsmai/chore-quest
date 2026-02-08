"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { completeChore, reopenChore } from "@/lib/firebase-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Chore } from "@/types";

const pointsColors: Record<number, string> = {
  5: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  10: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  15: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  20: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  25: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const frequencyLabels: Record<string, string> = {
  daily: "Täglich",
  weekly: "Wöchentlich",
  once: "Einmalig",
};

export function ChoreCard({ chore }: { chore: Chore }) {
  const user = useAppStore((s) => s.user);
  const userProfile = useAppStore((s) => s.userProfile);
  const [loading, setLoading] = useState(false);
  const [showXp, setShowXp] = useState(false);

  const isDone = chore.status === "done";

  async function handleComplete() {
    if (!user || !userProfile?.householdId) return;
    setLoading(true);
    try {
      await completeChore(
        userProfile.householdId,
        chore.id,
        user.uid,
        user.displayName || "Unbekannt"
      );
      setShowXp(true);
      setTimeout(() => setShowXp(false), 1500);
    } finally {
      setLoading(false);
    }
  }

  async function handleReopen() {
    if (!userProfile?.householdId) return;
    setLoading(true);
    try {
      await reopenChore(userProfile.householdId, chore.id);
    } finally {
      setLoading(false);
    }
  }

  const pointsColor =
    pointsColors[chore.points] || "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";

  return (
    <Card
      className={`relative transition-all ${isDone ? "opacity-60" : ""}`}
      padding="sm"
    >
      {showXp && (
        <div className="xp-toast absolute -top-2 right-4 rounded-full bg-indigo-500 px-3 py-1 text-sm font-bold text-white shadow-lg">
          +{chore.points} XP
        </div>
      )}
      <div className="flex items-start gap-3">
        <button
          onClick={isDone ? handleReopen : handleComplete}
          disabled={loading}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            isDone
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-zinc-300 hover:border-indigo-500 dark:border-zinc-600"
          }`}
          aria-label={isDone ? "Wieder öffnen" : "Erledigen"}
        >
          {isDone && (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={`font-medium ${isDone ? "text-zinc-400 line-through dark:text-zinc-500" : "text-zinc-900 dark:text-zinc-100"}`}
            >
              {chore.title}
            </h3>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${pointsColor}`}>
              {chore.points} XP
            </span>
          </div>
          {chore.description && (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {chore.description}
            </p>
          )}
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
            <span>{frequencyLabels[chore.frequency]}</span>
            {chore.assignedTo && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                Zugewiesen
              </span>
            )}
          </div>
        </div>

        <Link href={`/chores/${chore.id}/edit`}>
          <Button variant="ghost" size="sm">
            Bearbeiten
          </Button>
        </Link>
      </div>
    </Card>
  );
}
