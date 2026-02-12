"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { useRole } from "@/hooks/use-role";
import { updateRedemptionStatus } from "@/lib/firebase-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import type { Redemption } from "@/types";

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Ausstehend",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  approved: {
    label: "Genehmigt",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  rejected: {
    label: "Abgelehnt",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

function RedemptionItem({ redemption }: { redemption: Redemption }) {
  const { isAdmin } = useRole();
  const userProfile = useAppStore((s) => s.userProfile);
  const [loading, setLoading] = useState(false);

  const status = statusLabels[redemption.status];
  const isPending = redemption.status === "pending";

  async function handleStatusUpdate(newStatus: "approved" | "rejected") {
    if (!userProfile?.householdId) return;
    setLoading(true);
    try {
      await updateRedemptionStatus(userProfile.householdId, redemption.id, newStatus);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {redemption.rewardTitle}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {redemption.redeemedByName} &middot; {formatDateTime(redemption.redeemedAt)} &middot; {redemption.cost} XP
        </p>
      </div>
      {isAdmin && isPending && (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            disabled={loading}
            onClick={() => handleStatusUpdate("approved")}
          >
            Genehmigen
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={loading}
            onClick={() => handleStatusUpdate("rejected")}
          >
            Ablehnen
          </Button>
        </div>
      )}
    </div>
  );
}

export function RedemptionList() {
  const redemptions = useAppStore((s) => s.redemptions);
  const user = useAppStore((s) => s.user);
  const { isAdmin } = useRole();

  // Admin sees all, members see only their own
  const visible = isAdmin
    ? redemptions
    : redemptions.filter((r) => r.redeemedBy === user?.uid);

  const sorted = [...visible].sort((a, b) => b.redeemedAt - a.redeemedAt);

  if (sorted.length === 0) {
    return (
      <Card padding="md">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Noch keine Einlösungen.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <h3 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {isAdmin ? "Einlösungen verwalten" : "Meine Einlösungen"}
      </h3>
      <div className="flex flex-col gap-2">
        {sorted.map((r) => (
          <RedemptionItem key={r.id} redemption={r} />
        ))}
      </div>
    </Card>
  );
}
