"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { ChoreList } from "@/components/chores/chore-list";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  const userProfile = useAppStore((s) => s.userProfile);
  const household = useAppStore((s) => s.household);
  const rewards = useAppStore((s) => s.rewards);
  const redemptions = useAppStore((s) => s.redemptions);

  const activeRewards = rewards.filter((r) => r.active);
  const pendingRedemptions = redemptions.filter((r) => r.status === "pending");
  const pocketMoney = userProfile?.pocketMoney ?? 0;
  const hasPocketMoney = (household?.pocketMoneyRate ?? 0) > 0 || pocketMoney > 0;

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

      {hasPocketMoney && (
        <Link href="/pocket-money">
          <Card padding="sm" className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Taschengeld
                </span>
              </div>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {(pocketMoney / 100).toFixed(2)} €
              </span>
            </div>
          </Card>
        </Link>
      )}

      {activeRewards.length > 0 && (
        <Link href="/rewards">
          <Card padding="sm" className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎁</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {activeRewards.length} Belohnung{activeRewards.length !== 1 ? "en" : ""} verfügbar
                </span>
              </div>
              {pendingRedemptions.length > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  {pendingRedemptions.length} ausstehend
                </span>
              )}
            </div>
          </Card>
        </Link>
      )}

      <ChoreList />
    </div>
  );
}
