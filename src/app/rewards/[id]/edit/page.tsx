"use client";

import { use } from "react";
import { useAppStore } from "@/store/app-store";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { NavBar } from "@/components/layout/nav-bar";
import { RewardForm } from "@/components/rewards/reward-form";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EditRewardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const rewards = useAppStore((s) => s.rewards);
  const reward = rewards.find((r) => r.id === id);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="mx-auto max-w-lg px-4 pb-20 pt-4">
          {reward ? (
            <>
              <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Belohnung bearbeiten
              </h2>
              <RewardForm existingReward={reward} />
            </>
          ) : (
            <EmptyState
              icon="🔍"
              title="Belohnung nicht gefunden"
              description="Die Belohnung existiert nicht oder wurde deaktiviert."
            >
              <Link href="/rewards">
                <Button size="sm">Zurück zu Belohnungen</Button>
              </Link>
            </EmptyState>
          )}
        </main>
        <NavBar />
      </div>
    </AuthGuard>
  );
}
