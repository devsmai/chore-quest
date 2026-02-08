"use client";

import { useAppStore } from "@/store/app-store";
import { ChoreList } from "@/components/chores/chore-list";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  const userProfile = useAppStore((s) => s.userProfile);

  return (
    <div className="flex flex-col gap-4">
      {userProfile && (
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Deine Punkte
              </p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {userProfile.totalPoints} XP
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Streak</p>
              <p className="text-2xl font-bold text-amber-500">
                {userProfile.currentStreak > 0
                  ? `🔥 ${userProfile.currentStreak}`
                  : "—"}
              </p>
            </div>
          </div>
        </Card>
      )}

      <ChoreList />
    </div>
  );
}
