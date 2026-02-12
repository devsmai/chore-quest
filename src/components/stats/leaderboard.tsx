"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { getMemberProfiles } from "@/lib/firebase-service";
import { Card } from "@/components/ui/card";
import type { UserProfile } from "@/types";

export function Leaderboard() {
  const householdMembers = useAppStore((s) => s.householdMembers);
  const [members, setMembers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const uids = Object.keys(householdMembers);
    if (uids.length > 0) {
      getMemberProfiles(uids).then((profiles) => {
        setMembers(profiles.sort((a, b) => b.totalPoints - a.totalPoints));
      });
    }
  }, [householdMembers]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <Card padding="md">
      <h3 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Bestenliste
      </h3>
      {members.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Keine Mitglieder gefunden.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {members.map((member, i) => (
            <div
              key={member.uid}
              className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50"
            >
              <span className="w-8 text-center text-lg">
                {medals[i] || `${i + 1}.`}
              </span>
              <span className="flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {member.displayName}
                {householdMembers[member.uid] === "admin" && (
                  <span className="ml-1 rounded bg-amber-100 px-1 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Admin
                  </span>
                )}
              </span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {member.totalPoints} XP
              </span>
              {member.currentStreak > 0 && (
                <span className="text-xs text-amber-500">
                  🔥{member.currentStreak}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
