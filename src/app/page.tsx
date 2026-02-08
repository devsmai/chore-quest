"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { FullPageSpinner } from "@/components/ui/loading-spinner";

export default function Home() {
  const { user, isLoading, userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
    } else if (!userProfile) {
      // Still loading profile
    } else if (!userProfile.householdId) {
      router.replace("/household/setup");
    } else {
      router.replace("/dashboard");
    }
  }, [user, isLoading, userProfile, router]);

  return <FullPageSpinner />;
}
