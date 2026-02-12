"use client";

import { useAppStore } from "@/store/app-store";
import { useRole } from "@/hooks/use-role";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { NavBar } from "@/components/layout/nav-bar";
import { RewardList } from "@/components/rewards/reward-list";
import { RedemptionList } from "@/components/rewards/redemption-list";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RewardsPage() {
  const userProfile = useAppStore((s) => s.userProfile);
  const { isAdmin } = useRole();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 pb-20 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Belohnungen
            </h2>
            {isAdmin && (
              <Link href="/rewards/new">
                <Button size="sm">Neue Belohnung</Button>
              </Link>
            )}
          </div>

          {userProfile && (
            <Card padding="sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Dein Guthaben
                </p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {userProfile.totalPoints} XP
                </p>
              </div>
            </Card>
          )}

          <RewardList />
          <RedemptionList />
        </main>
        <NavBar />
      </div>
    </AuthGuard>
  );
}
