import { create } from "zustand";
import type { User } from "firebase/auth";
import type { Household, UserProfile, Chore } from "@/types";

interface AppState {
  user: User | null;
  isLoading: boolean;
  userProfile: UserProfile | null;
  household: Household | null;
  householdMembers: Record<string, boolean>;
  chores: Chore[];

  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setHousehold: (household: Household | null) => void;
  setHouseholdMembers: (members: Record<string, boolean>) => void;
  setChores: (chores: Chore[]) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isLoading: true,
  userProfile: null,
  household: null,
  householdMembers: {},
  chores: [],
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setHousehold: (household) => set({ household }),
  setHouseholdMembers: (householdMembers) => set({ householdMembers }),
  setChores: (chores) => set({ chores }),
  reset: () => set(initialState),
}));
