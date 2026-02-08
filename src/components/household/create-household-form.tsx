"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { createHousehold } from "@/lib/firebase-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateHouseholdForm() {
  const user = useAppStore((s) => s.user);
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    try {
      await createHousehold(name, user.uid);
      router.push("/dashboard");
    } catch {
      setError("Haushalt konnte nicht erstellt werden.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Name des Haushalts"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="z.B. Familie Müller"
        required
      />
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading} size="lg">
        {loading ? "Wird erstellt..." : "Haushalt erstellen"}
      </Button>
    </form>
  );
}
