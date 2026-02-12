export interface Household {
  id: string;
  name: string;
  createdBy: string;
  createdAt: number;
  inviteCode: string;
  pocketMoneyRate?: number; // Cent pro XP
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  householdId: string | null;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null; // "YYYY-MM-DD"
  pocketMoney?: number; // Kontostand in Cent
}

export type ChoreFrequency = "daily" | "weekly" | "once";
export type ChoreStatus = "open" | "done";

export interface Chore {
  id: string;
  title: string;
  description: string;
  points: number;
  assignedTo: string | null;
  frequency: ChoreFrequency;
  status: ChoreStatus;
  createdBy: string;
  createdAt: number;
  completedAt: number | null;
  completedBy: string | null;
  completionNote?: string;
  photoUrl?: string;
}

export interface ChoreHistoryEntry {
  id: string;
  choreId: string;
  choreTitle: string;
  completedBy: string;
  completedByName: string;
  points: number;
  completedAt: number;
  completionNote?: string;
  photoUrl?: string;
}

export type HouseholdRole = "admin" | "member";

export interface HouseholdMember {
  uid: string;
  displayName: string;
  totalPoints: number;
  currentStreak: number;
  role: HouseholdRole;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
  createdBy: string;
  createdAt: number;
  active: boolean;
}

export type RedemptionStatus = "pending" | "approved" | "rejected";

export interface Redemption {
  id: string;
  rewardId: string;
  rewardTitle: string;
  redeemedBy: string;
  redeemedByName: string;
  cost: number;
  redeemedAt: number;
  status: RedemptionStatus;
}

export interface PocketMoneyEntry {
  id: string;
  uid: string;
  userName: string;
  xpAmount: number;
  moneyAmount: number; // in Cent
  rate: number;
  createdAt: number;
}

export interface XpTransfer {
  id: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  toName: string;
  amount: number;
  rewardId: string;
  rewardTitle: string;
  createdAt: number;
}
