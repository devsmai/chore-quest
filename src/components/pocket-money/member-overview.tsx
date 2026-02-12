"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { getMemberProfiles } from "@/lib/firebase-service";
import { Card } from "@/components/ui/card";
import type { UserProfile } from "@/types";

export function MemberOverview() {
  const householdMembers = useAppStore((s) => s.householdMembers);
  const choreHistory = useAppStore((s) => s.choreHistory);
  const redemptions = useAppStore((s) => s.redemptions);
  const pocketMoneyHistory = useAppStore((s) => s.pocketMoneyHistory);
  const xpTransfers = useAppStore((s) => s.xpTransfers);

  const [members, setMembers] = useState<UserProfile[]>([]);
  const [selectedUid, setSelectedUid] = useState("");

  useEffect(() => {
    const uids = Object.keys(householdMembers);
    if (uids.length > 0) {
      getMemberProfiles(uids).then(setMembers);
    }
  }, [householdMembers]);

  const selected = members.find((m) => m.uid === selectedUid);

  // Stats for selected member
  const memberChores = choreHistory.filter((h) => h.completedBy === selectedUid);
  const memberRedemptions = redemptions.filter((r) => r.redeemedBy === selectedUid);
  const memberPocketMoney = pocketMoneyHistory.filter((p) => p.uid === selectedUid);
  const totalMoneyEarned = memberPocketMoney.reduce((sum, p) => sum + p.moneyAmount, 0);
  const memberTransfersSent = xpTransfers.filter((t) => t.fromUid === selectedUid);
  const memberTransfersReceived = xpTransfers.filter((t) => t.toUid === selectedUid);
  const totalXpSent = memberTransfersSent.reduce((sum, t) => sum + t.amount, 0);
  const totalXpReceived = memberTransfersReceived.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Card>
      <h3 className="mb-3 text-base font-bold text-zinc-900 dark:text-zinc-100">
        Mitglieder-Übersicht
      </h3>

      <select
        value={selectedUid}
        onChange={(e) => setSelectedUid(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      >
        <option value="">Mitglied auswählen...</option>
        {members.map((m) => (
          <option key={m.uid} value={m.uid}>
            {m.displayName} — {m.totalPoints} XP
          </option>
        ))}
      </select>

      {selected && (
        <div className="mt-4 flex flex-col gap-3">
          {/* Points overview */}
          <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">XP-Guthaben</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {selected.totalPoints} XP
            </span>
          </div>

          {/* Chore stats */}
          <div className="rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Aufgaben erledigt</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {memberChores.length}
              </span>
            </div>
            {memberChores.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {memberChores
                  .sort((a, b) => b.completedAt - a.completedAt)
                  .slice(0, 5)
                  .map((h) => (
                    <div key={h.id} className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="truncate">{h.choreTitle}</span>
                      <span className="ml-2 shrink-0">+{h.points} XP</span>
                    </div>
                  ))}
                {memberChores.length > 5 && (
                  <p className="text-xs text-zinc-400">...und {memberChores.length - 5} weitere</p>
                )}
              </div>
            )}
          </div>

          {/* Redemption stats */}
          <div className="rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Belohnungen eingelöst</span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {memberRedemptions.length}
              </span>
            </div>
            {memberRedemptions.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {memberRedemptions
                  .sort((a, b) => b.redeemedAt - a.redeemedAt)
                  .slice(0, 5)
                  .map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="truncate">{r.rewardTitle}</span>
                      <span className="ml-2 shrink-0">
                        -{r.cost} XP
                        <span className={`ml-1 ${
                          r.status === "approved" ? "text-emerald-500" :
                          r.status === "rejected" ? "text-red-500" :
                          "text-amber-500"
                        }`}>
                          ({r.status === "approved" ? "Genehmigt" : r.status === "rejected" ? "Abgelehnt" : "Ausstehend"})
                        </span>
                      </span>
                    </div>
                  ))}
                {memberRedemptions.length > 5 && (
                  <p className="text-xs text-zinc-400">...und {memberRedemptions.length - 5} weitere</p>
                )}
              </div>
            )}
          </div>

          {/* Pocket money */}
          <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Taschengeld verdient</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {(totalMoneyEarned / 100).toFixed(2)} €
            </span>
          </div>

          {/* XP Transfers */}
          {(totalXpSent > 0 || totalXpReceived > 0) && (
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">XP-Überweisungen</span>
              <div className="text-right text-xs">
                {totalXpSent > 0 && (
                  <p className="text-red-500">-{totalXpSent} XP gesendet</p>
                )}
                {totalXpReceived > 0 && (
                  <p className="text-emerald-500">+{totalXpReceived} XP erhalten</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
