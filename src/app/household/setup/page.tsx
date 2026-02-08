"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { CreateHouseholdForm } from "@/components/household/create-household-form";
import { JoinHouseholdForm } from "@/components/household/join-household-form";
import { Button } from "@/components/ui/button";
import { FullPageSpinner } from "@/components/ui/loading-spinner";
import { logoutUser } from "@/lib/auth-service";

export default function HouseholdSetupPage() {
  const { user, isLoading } = useAuth();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");

  if (isLoading || !user) return <FullPageSpinner />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4 dark:from-zinc-900 dark:to-zinc-800">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 text-3xl font-bold text-white shadow-lg">
            Q
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Haushalt einrichten
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Hallo {user.displayName}! Erstelle oder tritt einem Haushalt bei.
          </p>
        </div>

        {mode === "choose" && (
          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={() => setMode("create")}>
              Neuen Haushalt erstellen
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setMode("join")}
            >
              Mit Code beitreten
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => logoutUser()}
              className="mt-4"
            >
              Abmelden
            </Button>
          </div>
        )}

        {mode === "create" && (
          <>
            <CreateHouseholdForm />
            <button
              onClick={() => setMode("choose")}
              className="mt-4 block w-full text-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              Zurück
            </button>
          </>
        )}

        {mode === "join" && (
          <>
            <JoinHouseholdForm />
            <button
              onClick={() => setMode("choose")}
              className="mt-4 block w-full text-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              Zurück
            </button>
          </>
        )}
      </div>
    </div>
  );
}
