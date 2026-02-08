import {
  ref,
  set,
  get,
  push,
  update,
  remove,
  onValue,
  query,
  orderByChild,
  equalTo,
  type Unsubscribe,
} from "firebase/database";
import { db } from "@/lib/firebase";
import { generateInviteCode, getToday, getYesterday } from "@/lib/utils";
import type {
  Household,
  UserProfile,
  Chore,
  ChoreHistoryEntry,
} from "@/types";

// ─── User Profile ───────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  displayName: string,
  email: string
) {
  const profile: Omit<UserProfile, "uid"> = {
    displayName,
    email,
    householdId: null,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletionDate: null,
  };
  await set(ref(db, `userProfiles/${uid}`), profile);
}

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snapshot = await get(ref(db, `userProfiles/${uid}`));
  if (!snapshot.exists()) return null;
  return { uid, ...snapshot.val() } as UserProfile;
}

export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
): Unsubscribe {
  const profileRef = ref(db, `userProfiles/${uid}`);
  return onValue(profileRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({ uid, ...snapshot.val() } as UserProfile);
  });
}

// ─── Household ──────────────────────────────────────────────────

export async function createHousehold(
  name: string,
  uid: string
): Promise<string> {
  const householdRef = push(ref(db, "households"));
  const householdId = householdRef.key!;
  const inviteCode = generateInviteCode();

  const household: Omit<Household, "id"> = {
    name,
    createdBy: uid,
    createdAt: Date.now(),
    inviteCode,
  };

  await set(householdRef, household);
  await set(ref(db, `householdMembers/${householdId}/${uid}`), true);
  await update(ref(db, `userProfiles/${uid}`), { householdId });

  return householdId;
}

export async function joinHousehold(
  inviteCode: string,
  uid: string
): Promise<string> {
  const householdsRef = ref(db, "households");
  const q = query(householdsRef, orderByChild("inviteCode"), equalTo(inviteCode));
  const snapshot = await get(q);

  if (!snapshot.exists()) {
    throw new Error("Ungültiger Einladungscode");
  }

  let householdId = "";
  snapshot.forEach((child) => {
    householdId = child.key!;
  });

  await set(ref(db, `householdMembers/${householdId}/${uid}`), true);
  await update(ref(db, `userProfiles/${uid}`), { householdId });

  return householdId;
}

export async function leaveHousehold(uid: string, householdId: string) {
  await remove(ref(db, `householdMembers/${householdId}/${uid}`));
  await update(ref(db, `userProfiles/${uid}`), { householdId: null });
}

export function subscribeToHousehold(
  householdId: string,
  callback: (household: Household | null) => void
): Unsubscribe {
  const householdRef = ref(db, `households/${householdId}`);
  return onValue(householdRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({ id: householdId, ...snapshot.val() } as Household);
  });
}

export function subscribeToHouseholdMembers(
  householdId: string,
  callback: (members: Record<string, boolean>) => void
): Unsubscribe {
  const membersRef = ref(db, `householdMembers/${householdId}`);
  return onValue(membersRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : {});
  });
}

// ─── Chores ─────────────────────────────────────────────────────

export async function createChore(
  householdId: string,
  chore: Omit<Chore, "id" | "createdAt" | "completedAt" | "completedBy" | "status">
) {
  const choreRef = push(ref(db, `chores/${householdId}`));
  await set(choreRef, {
    ...chore,
    status: "open",
    createdAt: Date.now(),
    completedAt: null,
    completedBy: null,
  });
  return choreRef.key!;
}

export async function updateChore(
  householdId: string,
  choreId: string,
  updates: Partial<Pick<Chore, "title" | "description" | "points" | "assignedTo" | "frequency">>
) {
  await update(ref(db, `chores/${householdId}/${choreId}`), updates);
}

export async function deleteChore(householdId: string, choreId: string) {
  await remove(ref(db, `chores/${householdId}/${choreId}`));
}

export async function completeChore(
  householdId: string,
  choreId: string,
  uid: string,
  userName: string
) {
  // Get chore data
  const choreSnapshot = await get(ref(db, `chores/${householdId}/${choreId}`));
  if (!choreSnapshot.exists()) throw new Error("Aufgabe nicht gefunden");
  const choreData = choreSnapshot.val() as Omit<Chore, "id">;

  // Update chore status
  await update(ref(db, `chores/${householdId}/${choreId}`), {
    status: "done",
    completedAt: Date.now(),
    completedBy: uid,
  });

  // Add history entry
  const historyRef = push(ref(db, `choreHistory/${householdId}`));
  const historyEntry: Omit<ChoreHistoryEntry, "id"> = {
    choreId,
    choreTitle: choreData.title,
    completedBy: uid,
    completedByName: userName,
    points: choreData.points,
    completedAt: Date.now(),
  };
  await set(historyRef, historyEntry);

  // Update user points + streak
  await updateUserPoints(uid, choreData.points);
}

export async function reopenChore(householdId: string, choreId: string) {
  await update(ref(db, `chores/${householdId}/${choreId}`), {
    status: "open",
    completedAt: null,
    completedBy: null,
  });
  // Points are NOT taken back (MVP simplification)
}

export function subscribeToChores(
  householdId: string,
  callback: (chores: Chore[]) => void
): Unsubscribe {
  const choresRef = ref(db, `chores/${householdId}`);
  return onValue(choresRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const chores: Chore[] = [];
    snapshot.forEach((child) => {
      chores.push({ id: child.key!, ...child.val() } as Chore);
    });
    callback(chores);
  });
}

// ─── Points & Streaks ───────────────────────────────────────────

async function updateUserPoints(uid: string, points: number) {
  const profileSnapshot = await get(ref(db, `userProfiles/${uid}`));
  if (!profileSnapshot.exists()) return;

  const profile = profileSnapshot.val() as Omit<UserProfile, "uid">;
  const today = getToday();
  const yesterday = getYesterday();

  let newStreak = profile.currentStreak;
  if (profile.lastCompletionDate === yesterday) {
    newStreak = profile.currentStreak + 1;
  } else if (profile.lastCompletionDate !== today) {
    newStreak = 1;
  }
  // If lastCompletionDate === today, streak stays the same

  const longestStreak = Math.max(profile.longestStreak, newStreak);

  await update(ref(db, `userProfiles/${uid}`), {
    totalPoints: profile.totalPoints + points,
    currentStreak: newStreak,
    longestStreak,
    lastCompletionDate: today,
  });
}

// ─── Member Profiles (for leaderboard) ──────────────────────────

export async function getMemberProfiles(
  memberUids: string[]
): Promise<UserProfile[]> {
  const profiles: UserProfile[] = [];
  for (const uid of memberUids) {
    const profile = await getUserProfile(uid);
    if (profile) profiles.push(profile);
  }
  return profiles;
}
