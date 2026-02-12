"use client";

import { useAppStore } from "@/store/app-store";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { NavBar } from "@/components/layout/nav-bar";
import { PointsDisplay } from "@/components/stats/points-display";
import { StreakDisplay } from "@/components/stats/streak-display";
import { Leaderboard } from "@/components/stats/leaderboard";
import { StatsSummary } from "@/components/stats/stats-summary";
import { PocketMoneyStats } from "@/components/stats/pocket-money-stats";

export default function StatsPage() {
  const userProfile = useAppStore((s) => s.userProfile);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 pb-20 pt-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Statistik
          </h2>

          {userProfile && (
            <>
              <PointsDisplay points={userProfile.totalPoints} />
              <StreakDisplay
                currentStreak={userProfile.currentStreak}
                longestStreak={userProfile.longestStreak}
              />
            </>
          )}

          <StatsSummary />
          <Leaderboard />
          <PocketMoneyStats />
        </main>
        <NavBar />
      </div>
    </AuthGuard>
  );
}
