"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { joinHousehold } from "@/lib/firebase-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JoinHouseholdForm() {
  const user = useAppStore((s) => s.user);
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    try {
      await joinHousehold(inviteCode.toUpperCase().trim(), user.uid);
      router.push("/dashboard");
    } catch {
      setError("Ungültiger Einladungscode. Bitte prüfe den Code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Einladungscode"
        type="text"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
        placeholder="ABC123"
        required
        maxLength={6}
        className="text-center text-lg tracking-widest"
      />
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading || inviteCode.length < 6} size="lg">
        {loading ? "Wird beigetreten..." : "Haushalt beitreten"}
      </Button>
    </form>
  );
}
