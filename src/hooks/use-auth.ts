"use client";

import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAppStore } from "@/store/app-store";
import {
  subscribeToUserProfile,
  subscribeToHousehold,
  subscribeToHouseholdMembers,
  subscribeToChores,
} from "@/lib/firebase-service";
import type { Unsubscribe } from "firebase/database";

export function useAuth() {
  const {
    user,
    isLoading,
    userProfile,
    setUser,
    setLoading,
    setUserProfile,
    setHousehold,
    setHouseholdMembers,
    setChores,
    reset,
  } = useAppStore();

  const unsubscribesRef = useRef<Unsubscribe[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up previous subscriptions
      unsubscribesRef.current.forEach((unsub) => unsub());
      unsubscribesRef.current = [];

      if (firebaseUser) {
        setUser(firebaseUser);

        // Subscribe to user profile
        const unsubProfile = subscribeToUserProfile(
          firebaseUser.uid,
          (profile) => {
            setUserProfile(profile);
            setLoading(false);
          }
        );
        unsubscribesRef.current.push(unsubProfile);
      } else {
        reset();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribesRef.current.forEach((unsub) => unsub());
      unsubscribesRef.current = [];
    };
  }, [setUser, setLoading, setUserProfile, reset]);

  // Subscribe to household data when profile changes
  useEffect(() => {
    if (!userProfile?.householdId) {
      setHousehold(null);
      setHouseholdMembers({});
      setChores([]);
      return;
    }

    const householdId = userProfile.householdId;

    const unsubHousehold = subscribeToHousehold(householdId, setHousehold);
    const unsubMembers = subscribeToHouseholdMembers(
      householdId,
      setHouseholdMembers
    );
    const unsubChores = subscribeToChores(householdId, setChores);

    return () => {
      unsubHousehold();
      unsubMembers();
      unsubChores();
    };
  }, [
    userProfile?.householdId,
    setHousehold,
    setHouseholdMembers,
    setChores,
  ]);

  return { user, isLoading, userProfile };
}
