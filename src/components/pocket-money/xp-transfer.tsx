"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { getMemberProfiles, transferXp } from "@/lib/firebase-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { UserProfile } from "@/types";

export function XpTransfer() {
  const user = useAppStore((s) => s.user);
  const userProfile = useAppStore((s) => s.userProfile);
  const householdMembers = useAppStore((s) => s.householdMembers);
  const rewards = useAppStore((s) => s.rewards);
  const xpTransfers = useAppStore((s) => s.xpTransfers);

  const [members, setMembers] = useState<UserProfile[]>([]);
  const [rewardId, setRewardId] = useState("");
  const [toUid, setToUid] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const uids = Object.keys(householdMembers);
    if (uids.length > 0) {
      getMemberProfiles(uids).then(setMembers);
    }
  }, [householdMembers]);

  const activeRewards = rewards.filter((r) => r.active);
  const totalPoints = userProfile?.totalPoints ?? 0;
  const amount = parseInt(amountInput) || 0;
  const otherMembers = members.filter((m) => m.uid !== user?.uid);
  const recipient = members.find((m) => m.uid === toUid);
  const selectedReward = activeRewards.find((r) => r.id === rewardId);

  // How much has already been transferred toward this reward for this recipient?
  const alreadyTransferred = rewardId && toUid
    ? xpTransfers
        .filter((t) => t.rewardId === rewardId && t.toUid === toUid)
        .reduce((sum, t) => sum + t.amount, 0)
    : 0;
  const recipientPoints = recipient?.totalPoints ?? 0;
  const totalTowardReward = alreadyTransferred + recipientPoints;
  const remaining = selectedReward ? Math.max(0, selectedReward.cost - totalTowardReward) : 0;

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  async function handleTransfer() {
    if (!user || !userProfile?.householdId || !toUid || !rewardId || !selectedReward || amount <= 0) return;
    clearMessages();
    setLoading(true);
    try {
      await transferXp(
        userProfile.householdId,
        user.uid,
        user.displayName || "Unbekannt",
        toUid,
        recipient?.displayName || "Unbekannt",
        amount,
        rewardId,
        selectedReward.title
      );
      setSuccess(`${amount} XP an ${recipient?.displayName} für "${selectedReward.title}" überwiesen!`);
      setAmountInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler bei der Überweisung");
    } finally {
      setLoading(false);
    }
  }

  // Recent transfers involving current user
  const myTransfers = xpTransfers
    .filter((t) => t.fromUid === user?.uid || t.toUid === user?.uid)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  if (activeRewards.length === 0) return null;

  return (
    <Card>
      <h3 className="mb-3 text-base font-bold text-zinc-900 dark:text-zinc-100">
        XP für Belohnung überweisen
      </h3>

      <div className="flex flex-col gap-3">
        {/* Reward selection */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Belohnung
          </label>
          <select
            value={rewardId}
            onChange={(e) => { setRewardId(e.target.value); clearMessages(); }}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="">Belohnung wählen...</option>
            {activeRewards.map((r) => (
              <option key={r.id} value={r.id}>
                {r.icon} {r.title} ({r.cost} XP)
              </option>
            ))}
          </select>
        </div>

        {/* Recipient selection */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Für
          </label>
          <select
            value={toUid}
            onChange={(e) => { setToUid(e.target.value); clearMessages(); }}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="">Empfänger wählen...</option>
            {otherMembers.map((m) => (
              <option key={m.uid} value={m.uid}>
                {m.displayName} ({m.totalPoints} XP)
              </option>
            ))}
          </select>
        </div>

        {/* Progress toward reward */}
        {selectedReward && toUid && (
          <div className="rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
            <div className="mb-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Fortschritt für {selectedReward.title}</span>
              <span>{totalTowardReward} / {selectedReward.cost} XP</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${Math.min(100, (totalTowardReward / selectedReward.cost) * 100)}%` }}
              />
            </div>
            {remaining > 0 && (
              <p className="mt-1 text-xs text-zinc-400">
                Noch {remaining} XP nötig
              </p>
            )}
          </div>
        )}

        {/* Amount + send */}
        <div className="flex gap-2">
          <Input
            type="number"
            min={1}
            max={totalPoints}
            value={amountInput}
            onChange={(e) => { setAmountInput(e.target.value); clearMessages(); }}
            placeholder="XP-Betrag"
            className="flex-1"
          />
          <Button
            onClick={handleTransfer}
            disabled={loading || !toUid || !rewardId || amount <= 0 || amount > totalPoints}
          >
            {loading ? "..." : "Senden"}
          </Button>
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Verfügbar: {totalPoints} XP
        </p>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {success && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
        )}

        {/* Recent transfers */}
        {myTransfers.length > 0 && (
          <div className="mt-1 flex flex-col gap-1">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Letzte Überweisungen
            </p>
            {myTransfers.map((t) => {
              const isSent = t.fromUid === user?.uid;
              return (
                <div key={t.id} className="flex items-center justify-between text-xs">
                  <span className="truncate text-zinc-500 dark:text-zinc-400">
                    {isSent ? `An ${t.toName}` : `Von ${t.fromName}`} — {t.rewardTitle}
                  </span>
                  <span className={`shrink-0 ml-2 ${isSent ? "text-red-500" : "text-emerald-500"}`}>
                    {isSent ? "-" : "+"}{t.amount} XP
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
