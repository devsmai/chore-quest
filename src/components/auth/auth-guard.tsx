"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAppStore } from "@/store/app-store";
import { FullPageSpinner } from "@/components/ui/loading-spinner";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const userProfile = useAppStore((s) => s.userProfile);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (userProfile && !userProfile.householdId) {
      router.replace("/household/setup");
    }
  }, [user, isLoading, userProfile, router]);

  if (isLoading) return <FullPageSpinner />;
  if (!user) return <FullPageSpinner />;
  if (userProfile && !userProfile.householdId) return <FullPageSpinner />;

  return <>{children}</>;
}
