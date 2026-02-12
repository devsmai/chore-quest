"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { useRole } from "@/hooks/use-role";
import { reopenChore } from "@/lib/firebase-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompleteChoreDialog } from "@/components/chores/complete-chore-dialog";
import type { Chore } from "@/types";

const frequencyLabels: Record<string, string> = {
  daily: "Täglich",
  weekly: "Wöchentlich",
  once: "Einmalig",
};

export function ChoreCard({ chore }: { chore: Chore }) {
  const userProfile = useAppStore((s) => s.userProfile);
  const { isAdmin } = useRole();
  const [loading, setLoading] = useState(false);
  const [showXp, setShowXp] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);

  const isDone = chore.status === "done";

  function handleCheckClick() {
    if (isDone) {
      handleReopen();
    } else {
      setShowDialog(true);
    }
  }

  function handleCompleted() {
    setShowDialog(false);
    setShowXp(true);
    setTimeout(() => setShowXp(false), 1500);
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

  return (
    <>
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
            onClick={handleCheckClick}
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
              <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
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

            {isDone && chore.completionNote && (
              <p className="mt-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {chore.completionNote}
              </p>
            )}

            {isDone && chore.photoUrl && (
              <>
                <img
                  src={chore.photoUrl}
                  alt="Erledigungs-Foto"
                  onClick={() => setShowPhoto(true)}
                  className="mt-2 h-24 w-full cursor-pointer rounded-xl object-cover transition-transform hover:scale-[1.02]"
                />
              </>
            )}
          </div>

          {isAdmin && (
            <Link href={`/chores/${chore.id}/edit`}>
              <Button variant="ghost" size="sm">
                Bearbeiten
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {showDialog && (
        <CompleteChoreDialog
          chore={chore}
          onClose={() => setShowDialog(false)}
          onCompleted={handleCompleted}
        />
      )}

      {showPhoto && chore.photoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowPhoto(false)}
        >
          <img
            src={chore.photoUrl}
            alt="Erledigungs-Foto"
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
