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
  subscribeToChoreHistory,
  subscribeToRewards,
  subscribeToRedemptions,
  subscribeToPocketMoneyHistory,
  subscribeToXpTransfers,
} from "@/lib/firebase-service";
import type { Unsubscribe } from "firebase/database";

export function useAuth() {
  const {
    user,
    isLoading,
    userProfile,
    household,
    setUser,
    setLoading,
    setUserProfile,
    setHousehold,
    setHouseholdMembers,
    setChores,
    setChoreHistory,
    setRewards,
    setRedemptions,
    setPocketMoneyHistory,
    setXpTransfers,
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
      setChoreHistory([]);
      setRewards([]);
      setRedemptions([]);
      setPocketMoneyHistory([]);
      setXpTransfers([]);
      return;
    }

    const householdId = userProfile.householdId;
    const createdBy = household?.createdBy ?? "";

    const unsubHousehold = subscribeToHousehold(householdId, setHousehold);
    const unsubMembers = subscribeToHouseholdMembers(
      householdId,
      createdBy,
      setHouseholdMembers
    );
    const unsubChores = subscribeToChores(householdId, setChores);
    const unsubChoreHistory = subscribeToChoreHistory(householdId, setChoreHistory);
    const unsubRewards = subscribeToRewards(householdId, setRewards);
    const unsubRedemptions = subscribeToRedemptions(householdId, setRedemptions);
    const unsubPocketMoney = subscribeToPocketMoneyHistory(householdId, setPocketMoneyHistory);
    const unsubXpTransfers = subscribeToXpTransfers(householdId, setXpTransfers);

    return () => {
      unsubHousehold();
      unsubMembers();
      unsubChores();
      unsubChoreHistory();
      unsubRewards();
      unsubRedemptions();
      unsubPocketMoney();
      unsubXpTransfers();
    };
  }, [
    userProfile?.householdId,
    household?.createdBy,
    setHousehold,
    setHouseholdMembers,
    setChores,
    setChoreHistory,
    setRewards,
    setRedemptions,
    setPocketMoneyHistory,
    setXpTransfers,
  ]);

  return { user, isLoading, userProfile };
}
