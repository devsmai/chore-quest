"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(email, password, displayName);
      router.push("/");
    } catch {
      setError(
        "Registrierung fehlgeschlagen. Vielleicht existiert diese E-Mail bereits."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Name"
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Max Mustermann"
        required
      />
      <Input
        label="E-Mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="max@beispiel.de"
        required
      />
      <Input
        label="Passwort"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mindestens 6 Zeichen"
        required
        minLength={6}
      />
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading} size="lg">
        {loading ? "Wird registriert..." : "Registrieren"}
      </Button>
    </form>
  );
}
