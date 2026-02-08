"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { NavBar } from "@/components/layout/nav-bar";
import { ChoreForm } from "@/components/chores/chore-form";

export default function NewChorePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="mx-auto max-w-lg px-4 pb-20 pt-4">
          <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Neue Aufgabe
          </h2>
          <ChoreForm />
        </main>
        <NavBar />
      </div>
    </AuthGuard>
  );
}
