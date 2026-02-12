import { create } from "zustand";
import type { User } from "firebase/auth";
import type { Household, UserProfile, Chore, ChoreHistoryEntry, HouseholdRole, Reward, Redemption, PocketMoneyEntry, XpTransfer } from "@/types";

interface AppState {
  user: User | null;
  isLoading: boolean;
  userProfile: UserProfile | null;
  household: Household | null;
  householdMembers: Record<string, HouseholdRole>;
  chores: Chore[];
  choreHistory: ChoreHistoryEntry[];
  rewards: Reward[];
  redemptions: Redemption[];
  pocketMoneyHistory: PocketMoneyEntry[];
  xpTransfers: XpTransfer[];

  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setHousehold: (household: Household | null) => void;
  setHouseholdMembers: (members: Record<string, HouseholdRole>) => void;
  setChores: (chores: Chore[]) => void;
  setChoreHistory: (entries: ChoreHistoryEntry[]) => void;
  setRewards: (rewards: Reward[]) => void;
  setRedemptions: (redemptions: Redemption[]) => void;
  setPocketMoneyHistory: (entries: PocketMoneyEntry[]) => void;
  setXpTransfers: (transfers: XpTransfer[]) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isLoading: true,
  userProfile: null,
  household: null,
  householdMembers: {},
  chores: [],
  choreHistory: [],
  rewards: [],
  redemptions: [],
  pocketMoneyHistory: [],
  xpTransfers: [],
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setHousehold: (household) => set({ household }),
  setHouseholdMembers: (householdMembers) => set({ householdMembers }),
  setChores: (chores) => set({ chores }),
  setChoreHistory: (choreHistory) => set({ choreHistory }),
  setRewards: (rewards) => set({ rewards }),
  setRedemptions: (redemptions) => set({ redemptions }),
  setPocketMoneyHistory: (pocketMoneyHistory) => set({ pocketMoneyHistory }),
  setXpTransfers: (xpTransfers) => set({ xpTransfers }),
  reset: () => set(initialState),
}));
