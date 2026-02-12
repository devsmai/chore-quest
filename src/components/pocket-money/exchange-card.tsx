"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { exchangeXpForMoney } from "@/lib/firebase-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function ExchangeCard() {
  const user = useAppStore((s) => s.user);
  const userProfile = useAppStore((s) => s.userProfile);
  const household = useAppStore((s) => s.household);

  const [xpInput, setXpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const rate = household?.pocketMoneyRate ?? 0;
  const totalPoints = userProfile?.totalPoints ?? 0;
  const pocketMoney = userProfile?.pocketMoney ?? 0;

  const xpAmount = parseInt(xpInput) || 0;
  const moneyPreview = rate > 0 && xpAmount > 0
    ? ((xpAmount * rate) / 100).toFixed(2)
    : null;

  async function handleExchange() {
    if (!user || !userProfile?.householdId || xpAmount <= 0) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await exchangeXpForMoney(
        userProfile.householdId,
        user.uid,
        user.displayName || "Unbekannt",
        xpAmount
      );
      setSuccess(`${xpAmount} XP in ${((xpAmount * rate) / 100).toFixed(2)} € umgetauscht!`);
      setXpInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Umtausch");
    } finally {
      setLoading(false);
    }
  }

  if (rate <= 0) {
    return (
      <Card>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Der Admin hat noch keinen Wechselkurs eingestellt.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Taschengeld</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {(pocketMoney / 100).toFixed(2)} €
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Verfügbar</p>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {totalPoints} XP
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Kurs: {rate} Cent/XP ({((1000 * rate) / 100).toFixed(2)} € pro 1000 XP)
        </p>

        <div className="flex gap-2">
          <Input
            type="number"
            min={1}
            max={totalPoints}
            value={xpInput}
            onChange={(e) => {
              setXpInput(e.target.value);
              setError("");
              setSuccess("");
            }}
            placeholder="XP-Betrag"
            className="flex-1"
          />
          <Button onClick={handleExchange} disabled={loading || xpAmount <= 0 || xpAmount > totalPoints}>
            {loading ? "..." : "Umtauschen"}
          </Button>
        </div>

        {moneyPreview && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            = {moneyPreview} €
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {success && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
        )}
      </div>
    </Card>
  );
}
