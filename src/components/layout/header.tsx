"use client";

import { useAppStore } from "@/store/app-store";
import { logoutUser } from "@/lib/auth-service";
import { Button } from "@/components/ui/button";

export function Header() {
  const household = useAppStore((s) => s.household);
  const user = useAppStore((s) => s.user);

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {household?.name || "Chore Quest"}
          </h1>
          {household?.inviteCode && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Code: {household.inviteCode}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {user?.displayName?.split(" ")[0]}
          </span>
          <Button variant="ghost" size="sm" onClick={() => logoutUser()}>
            Abmelden
          </Button>
        </div>
      </div>
    </header>
  );
}
