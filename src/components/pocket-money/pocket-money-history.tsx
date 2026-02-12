"use client";

import { useAppStore } from "@/store/app-store";
import { Card } from "@/components/ui/card";

export function PocketMoneyHistory() {
  const history = useAppStore((s) => s.pocketMoneyHistory);

  const sorted = [...history].sort((a, b) => b.createdAt - a.createdAt);

  if (sorted.length === 0) {
    return (
      <Card padding="sm">
        <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
          Noch keine Umtäusche
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
        Verlauf
      </h3>
      {sorted.map((entry) => (
        <Card key={entry.id} padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {entry.userName}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {new Date(entry.createdAt).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-red-500">
                -{entry.xpAmount} XP
              </p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                +{(entry.moneyAmount / 100).toFixed(2)} €
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
