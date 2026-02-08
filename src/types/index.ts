export interface Household {
  id: string;
  name: string;
  createdBy: string;
  createdAt: number;
  inviteCode: string;
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
}

export interface ChoreHistoryEntry {
  id: string;
  choreId: string;
  choreTitle: string;
  completedBy: string;
  completedByName: string;
  points: number;
  completedAt: number;
}

export interface HouseholdMember {
  uid: string;
  displayName: string;
  totalPoints: number;
  currentStreak: number;
}
