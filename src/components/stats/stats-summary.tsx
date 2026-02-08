"use client";

import { useAppStore } from "@/store/app-store";
import { Card } from "@/components/ui/card";

export function StatsSummary() {
  const chores = useAppStore((s) => s.chores);
  const user = useAppStore((s) => s.user);

  const totalChores = chores.length;
  const doneChores = chores.filter((c) => c.status === "done").length;
  const myDone = chores.filter(
    (c) => c.status === "done" && c.completedBy === user?.uid
  ).length;

  const stats = [
    { label: "Aufgaben gesamt", value: totalChores, icon: "📋" },
    { label: "Erledigt", value: doneChores, icon: "✅" },
    { label: "Von dir erledigt", value: myDone, icon: "💪" },
    {
      label: "Offen",
      value: totalChores - doneChores,
      icon: "📝",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((stat) => (
        <Card key={stat.label} padding="sm" className="text-center">
          <span className="text-xl">{stat.icon}</span>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {stat.value}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {stat.label}
          </p>
        </Card>
      ))}
    </div>
  );
}
