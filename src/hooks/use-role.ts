"use client";

import { useAppStore } from "@/store/app-store";
import type { HouseholdRole } from "@/types";

export function useRole(): { role: HouseholdRole | null; isAdmin: boolean } {
  const user = useAppStore((s) => s.user);
  const householdMembers = useAppStore((s) => s.householdMembers);

  if (!user) return { role: null, isAdmin: false };

  const role = householdMembers[user.uid] ?? null;
  return { role, isAdmin: role === "admin" };
}
