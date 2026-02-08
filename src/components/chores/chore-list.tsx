"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { ChoreCard } from "@/components/chores/chore-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Filter = "all" | "open" | "done" | "mine";

export function ChoreList() {
  const chores = useAppStore((s) => s.chores);
  const user = useAppStore((s) => s.user);
  const [filter, setFilter] = useState<Filter>("open");

  const filtered = chores.filter((chore) => {
    if (filter === "open") return chore.status === "open";
    if (filter === "done") return chore.status === "done";
    if (filter === "mine")
      return chore.assignedTo === user?.uid && chore.status === "open";
    return true;
  });

  const tabs: { key: Filter; label: string }[] = [
    { key: "open", label: "Offen" },
    { key: "mine", label: "Meine" },
    { key: "done", label: "Erledigt" },
    { key: "all", label: "Alle" },
  ];

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={filter === "done" ? "🎉" : "📝"}
          title={
            filter === "done"
              ? "Noch keine erledigten Aufgaben"
              : "Keine Aufgaben"
          }
          description={
            filter === "mine"
              ? "Dir sind keine offenen Aufgaben zugewiesen."
              : "Erstelle eine neue Aufgabe, um loszulegen!"
          }
        >
          {filter !== "done" && (
            <Link href="/chores/new">
              <Button size="sm">Aufgabe erstellen</Button>
            </Link>
          )}
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((chore) => (
            <ChoreCard key={chore.id} chore={chore} />
          ))}
        </div>
      )}
    </div>
  );
}
