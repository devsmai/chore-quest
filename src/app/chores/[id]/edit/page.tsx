"use client";

import { use } from "react";
import { useAppStore } from "@/store/app-store";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { NavBar } from "@/components/layout/nav-bar";
import { ChoreForm } from "@/components/chores/chore-form";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EditChorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const chores = useAppStore((s) => s.chores);
  const chore = chores.find((c) => c.id === id);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="mx-auto max-w-lg px-4 pb-20 pt-4">
          {chore ? (
            <>
              <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Aufgabe bearbeiten
              </h2>
              <ChoreForm existingChore={chore} />
            </>
          ) : (
            <EmptyState
              icon="🔍"
              title="Aufgabe nicht gefunden"
              description="Die Aufgabe existiert nicht oder wurde gelöscht."
            >
              <Link href="/dashboard">
                <Button size="sm">Zurück zum Dashboard</Button>
              </Link>
            </EmptyState>
          )}
        </main>
        <NavBar />
      </div>
    </AuthGuard>
  );
}
