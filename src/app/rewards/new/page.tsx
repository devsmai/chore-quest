"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { NavBar } from "@/components/layout/nav-bar";
import { RewardForm } from "@/components/rewards/reward-form";

export default function NewRewardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="mx-auto max-w-lg px-4 pb-20 pt-4">
          <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Neue Belohnung
          </h2>
          <RewardForm />
        </main>
        <NavBar />
      </div>
    </AuthGuard>
  );
}
