"use client";

import { useRole } from "@/hooks/use-role";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { NavBar } from "@/components/layout/nav-bar";
import { ExchangeCard } from "@/components/pocket-money/exchange-card";
import { XpTransfer } from "@/components/pocket-money/xp-transfer";
import { PocketMoneyHistory } from "@/components/pocket-money/pocket-money-history";
import { RateSetting } from "@/components/pocket-money/rate-setting";
import { MemberOverview } from "@/components/pocket-money/member-overview";

export default function PocketMoneyPage() {
  const { isAdmin } = useRole();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 pb-20 pt-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Taschengeld
          </h2>

          <ExchangeCard />

          <XpTransfer />

          {isAdmin && <RateSetting />}

          {isAdmin && <MemberOverview />}

          <PocketMoneyHistory />
        </main>
        <NavBar />
      </div>
    </AuthGuard>
  );
}
