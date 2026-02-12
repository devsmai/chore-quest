"use client";

import { useAppStore } from "@/store/app-store";
import { useRole } from "@/hooks/use-role";
import { RewardCard } from "@/components/rewards/reward-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function RewardList() {
  const rewards = useAppStore((s) => s.rewards);
  const { isAdmin } = useRole();

  const activeRewards = rewards.filter((r) => r.active);

  if (activeRewards.length === 0) {
    return (
      <EmptyState
        icon="🎁"
        title="Keine Belohnungen"
        description={
          isAdmin
            ? "Erstelle eine Belohnung, die sich Mitglieder verdienen können!"
            : "Der Admin hat noch keine Belohnungen erstellt."
        }
      >
        {isAdmin && (
          <Link href="/rewards/new">
            <Button size="sm">Belohnung erstellen</Button>
          </Link>
        )}
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {activeRewards.map((reward) => (
        <RewardCard key={reward.id} reward={reward} />
      ))}
    </div>
  );
}
