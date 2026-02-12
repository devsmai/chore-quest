"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { getMemberProfiles } from "@/lib/firebase-service";
import { Card } from "@/components/ui/card";
import type { UserProfile } from "@/types";

export function PocketMoneyStats() {
  const householdMembers = useAppStore((s) => s.householdMembers);
  const pocketMoneyHistory = useAppStore((s) => s.pocketMoneyHistory);
  const [members, setMembers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const uids = Object.keys(householdMembers);
    if (uids.length > 0) {
      getMemberProfiles(uids).then(setMembers);
    }
  }, [householdMembers]);

  // Aggregate total money earned per user from history
  const earnedByUid: Record<string, number> = {};
  for (const entry of pocketMoneyHistory) {
    earnedByUid[entry.uid] = (earnedByUid[entry.uid] ?? 0) + entry.moneyAmount;
  }

  const ranked = members
    .map((m) => ({ ...m, totalEarned: earnedByUid[m.uid] ?? 0 }))
    .filter((m) => m.totalEarned > 0 || (m.pocketMoney ?? 0) > 0)
    .sort((a, b) => b.totalEarned - a.totalEarned);

  if (ranked.length === 0) return null;

  return (
    <Card padding="md">
      <h3 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Taschengeld-Statistik
      </h3>
      <div className="flex flex-col gap-2">
        {ranked.map((member) => (
          <div
            key={member.uid}
            className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50"
          >
            <span className="text-lg">💰</span>
            <span className="flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {member.displayName}
            </span>
            <div className="text-right">
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {(member.totalEarned / 100).toFixed(2)} € verdient
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {((member.pocketMoney ?? 0) / 100).toFixed(2)} € Guthaben
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
