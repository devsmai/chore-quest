"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { useRole } from "@/hooks/use-role";
import { createReward, updateReward, deleteReward } from "@/lib/firebase-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Reward } from "@/types";

interface RewardFormProps {
  existingReward?: Reward;
}

const iconOptions = ["🍦", "🎮", "🎬", "🍕", "📱", "🛍️", "🎉", "🏖️"];
const costPresets = [25, 50, 100, 250, 500];

export function RewardForm({ existingReward }: RewardFormProps) {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const userProfile = useAppStore((s) => s.userProfile);
  const { isAdmin } = useRole();

  const [title, setTitle] = useState(existingReward?.title || "");
  const [description, setDescription] = useState(existingReward?.description || "");
  const [cost, setCost] = useState(existingReward?.cost || 50);
  const [icon, setIcon] = useState(existingReward?.icon || "🍦");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin && user) {
      router.replace("/rewards");
    }
  }, [isAdmin, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !userProfile?.householdId) return;
    setError("");
    setLoading(true);

    try {
      if (existingReward) {
        await updateReward(userProfile.householdId, existingReward.id, {
          title,
          description,
          cost,
          icon,
        });
      } else {
        await createReward(userProfile.householdId, {
          title,
          description,
          cost,
          icon,
          createdBy: user.uid,
        });
      }
      router.push("/rewards");
    } catch {
      setError("Belohnung konnte nicht gespeichert werden.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!existingReward || !userProfile?.householdId) return;
    if (!confirm("Belohnung wirklich deaktivieren?")) return;
    setLoading(true);
    try {
      await deleteReward(userProfile.householdId, existingReward.id);
      router.push("/rewards");
    } catch {
      setError("Belohnung konnte nicht gelöscht werden.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Belohnung"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="z.B. Eis essen gehen"
        required
      />

      <Input
        label="Beschreibung (optional)"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Weitere Details..."
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Icon
        </label>
        <div className="flex flex-wrap gap-2">
          {iconOptions.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`rounded-xl border-2 p-2 text-2xl transition-colors ${
                icon === ic
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                  : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700"
              }`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Kosten (XP)
        </label>
        <div className="flex gap-2">
          {costPresets.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCost(c)}
              className={`flex-1 rounded-xl border-2 py-2 text-sm font-medium transition-colors ${
                cost === c
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <Input
          type="number"
          min={1}
          value={cost}
          onChange={(e) => setCost(Math.max(1, parseInt(e.target.value) || 1))}
          placeholder="Beliebige Kosten"
          className="mt-1"
        />
      </div>

      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <Button type="submit" disabled={loading} size="lg">
        {loading
          ? "Wird gespeichert..."
          : existingReward
            ? "Speichern"
            : "Belohnung erstellen"}
      </Button>

      {existingReward && (
        <Button
          type="button"
          variant="danger"
          size="lg"
          onClick={handleDelete}
          disabled={loading}
        >
          Belohnung deaktivieren
        </Button>
      )}
    </form>
  );
}
