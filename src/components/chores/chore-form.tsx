"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { useRole } from "@/hooks/use-role";
import {
  createChore,
  updateChore,
  deleteChore,
  getMemberProfiles,
} from "@/lib/firebase-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Chore, ChoreFrequency, UserProfile } from "@/types";

interface ChoreFormProps {
  existingChore?: Chore;
}

const pointsPresets = [5, 10, 25, 50, 100];
const frequencyOptions: { value: ChoreFrequency; label: string }[] = [
  { value: "daily", label: "Täglich" },
  { value: "weekly", label: "Wöchentlich" },
  { value: "once", label: "Einmalig" },
];

export function ChoreForm({ existingChore }: ChoreFormProps) {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const userProfile = useAppStore((s) => s.userProfile);
  const householdMembers = useAppStore((s) => s.householdMembers);
  const { isAdmin } = useRole();

  useEffect(() => {
    if (!isAdmin && user) {
      router.replace("/dashboard");
    }
  }, [isAdmin, user, router]);

  const [title, setTitle] = useState(existingChore?.title || "");
  const [description, setDescription] = useState(
    existingChore?.description || ""
  );
  const [points, setPoints] = useState(existingChore?.points || 10);
  const [frequency, setFrequency] = useState<ChoreFrequency>(
    existingChore?.frequency || "once"
  );
  const [assignedTo, setAssignedTo] = useState(
    existingChore?.assignedTo || ""
  );
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const memberUids = Object.keys(householdMembers);
    if (memberUids.length > 0) {
      getMemberProfiles(memberUids).then(setMembers);
    }
  }, [householdMembers]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !userProfile?.householdId) return;
    setError("");
    setLoading(true);

    try {
      if (existingChore) {
        await updateChore(userProfile.householdId, existingChore.id, {
          title,
          description,
          points,
          frequency,
          assignedTo: assignedTo || null,
        });
      } else {
        await createChore(userProfile.householdId, {
          title,
          description,
          points,
          frequency,
          assignedTo: assignedTo || null,
          createdBy: user.uid,
        });
      }
      router.push("/dashboard");
    } catch {
      setError("Aufgabe konnte nicht gespeichert werden.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!existingChore || !userProfile?.householdId) return;
    if (!confirm("Aufgabe wirklich löschen?")) return;
    setLoading(true);
    try {
      await deleteChore(userProfile.householdId, existingChore.id);
      router.push("/dashboard");
    } catch {
      setError("Aufgabe konnte nicht gelöscht werden.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Aufgabe"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="z.B. Küche aufräumen"
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
          Punkte (XP)
        </label>
        <div className="flex gap-2">
          {pointsPresets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPoints(p)}
              className={`flex-1 rounded-xl border-2 py-2 text-sm font-medium transition-colors ${
                points === p
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <Input
          type="number"
          min={1}
          value={points}
          onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value) || 1))}
          placeholder="Beliebige Punktzahl"
          className="mt-1"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Häufigkeit
        </label>
        <div className="flex gap-2">
          {frequencyOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFrequency(opt.value)}
              className={`flex-1 rounded-xl border-2 py-2 text-sm font-medium transition-colors ${
                frequency === opt.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Zuweisen an (optional)
        </label>
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="">Niemand</option>
          {members.map((m) => (
            <option key={m.uid} value={m.uid}>
              {m.displayName}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <Button type="submit" disabled={loading} size="lg">
        {loading
          ? "Wird gespeichert..."
          : existingChore
            ? "Speichern"
            : "Aufgabe erstellen"}
      </Button>

      {existingChore && (
        <Button
          type="button"
          variant="danger"
          size="lg"
          onClick={handleDelete}
          disabled={loading}
        >
          Aufgabe löschen
        </Button>
      )}
    </form>
  );
}
