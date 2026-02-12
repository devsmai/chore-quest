"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { useRole } from "@/hooks/use-role";
import { redeemReward } from "@/lib/firebase-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Reward } from "@/types";

export function RewardCard({ reward }: { reward: Reward }) {
  const user = useAppStore((s) => s.user);
  const userProfile = useAppStore((s) => s.userProfile);
  const { isAdmin } = useRole();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const canAfford = (userProfile?.totalPoints ?? 0) >= reward.cost;

  async function handleRedeem() {
    if (!user || !userProfile?.householdId) return;
    setLoading(true);
    try {
      await redeemReward(
        userProfile.householdId,
        reward,
        user.uid,
        user.displayName || "Unbekannt"
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
    } catch {
      alert("Nicht genügend Punkte!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="relative" padding="sm">
      {showToast && (
        <div className="xp-toast absolute -top-2 right-4 rounded-full bg-emerald-500 px-3 py-1 text-sm font-bold text-white shadow-lg">
          -{reward.cost} XP
        </div>
      )}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{reward.icon}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
            {reward.title}
          </h3>
          {reward.description && (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {reward.description}
            </p>
          )}
          <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
            {reward.cost} XP
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            disabled={!canAfford || loading}
            onClick={handleRedeem}
          >
            {loading ? "..." : "Einlösen"}
          </Button>
          {isAdmin && (
            <Link href={`/rewards/${reward.id}/edit`}>
              <Button variant="ghost" size="sm">
                Bearbeiten
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
