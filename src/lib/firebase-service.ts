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
  runTransaction,
  type Unsubscribe,
} from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { generateInviteCode, getToday, getYesterday } from "@/lib/utils";
import type {
  Household,
  UserProfile,
  Chore,
  ChoreHistoryEntry,
  HouseholdRole,
  Reward,
  Redemption,
  RedemptionStatus,
  PocketMoneyEntry,
  XpTransfer,
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
  await set(ref(db, `householdMembers/${householdId}/${uid}`), "admin");
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

  await set(ref(db, `householdMembers/${householdId}/${uid}`), "member");
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
  createdBy: string,
  callback: (members: Record<string, HouseholdRole>) => void
): Unsubscribe {
  const membersRef = ref(db, `householdMembers/${householdId}`);
  return onValue(membersRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback({});
      return;
    }
    const raw = snapshot.val() as Record<string, boolean | HouseholdRole>;
    const mapped: Record<string, HouseholdRole> = {};
    for (const [uid, value] of Object.entries(raw)) {
      if (value === "admin" || value === "member") {
        mapped[uid] = value;
      } else {
        // Backwards compatibility: true → derive role from createdBy
        mapped[uid] = uid === createdBy ? "admin" : "member";
      }
    }
    callback(mapped);
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

export async function uploadChorePhoto(
  householdId: string,
  choreId: string,
  file: File
): Promise<string> {
  const fileRef = storageRef(
    storage,
    `chore-photos/${householdId}/${choreId}_${Date.now()}.jpg`
  );
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

export async function completeChore(
  householdId: string,
  choreId: string,
  uid: string,
  userName: string,
  completionNote?: string,
  photoUrl?: string
) {
  // Get chore data
  const choreSnapshot = await get(ref(db, `chores/${householdId}/${choreId}`));
  if (!choreSnapshot.exists()) throw new Error("Aufgabe nicht gefunden");
  const choreData = choreSnapshot.val() as Omit<Chore, "id">;

  // Update chore status
  const choreUpdate: Record<string, unknown> = {
    status: "done",
    completedAt: Date.now(),
    completedBy: uid,
  };
  if (completionNote) choreUpdate.completionNote = completionNote;
  if (photoUrl) choreUpdate.photoUrl = photoUrl;
  await update(ref(db, `chores/${householdId}/${choreId}`), choreUpdate);

  // Add history entry
  const historyRef = push(ref(db, `choreHistory/${householdId}`));
  const historyEntry: Omit<ChoreHistoryEntry, "id"> = {
    choreId,
    choreTitle: choreData.title,
    completedBy: uid,
    completedByName: userName,
    points: choreData.points,
    completedAt: Date.now(),
    ...(completionNote ? { completionNote } : {}),
    ...(photoUrl ? { photoUrl } : {}),
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

export function subscribeToChoreHistory(
  householdId: string,
  callback: (entries: ChoreHistoryEntry[]) => void
): Unsubscribe {
  const historyRef = ref(db, `choreHistory/${householdId}`);
  return onValue(historyRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const entries: ChoreHistoryEntry[] = [];
    snapshot.forEach((child) => {
      entries.push({ id: child.key!, ...child.val() } as ChoreHistoryEntry);
    });
    callback(entries);
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

// ─── Rewards ────────────────────────────────────────────────────

export async function createReward(
  householdId: string,
  reward: Omit<Reward, "id" | "createdAt" | "active">
) {
  const rewardRef = push(ref(db, `rewards/${householdId}`));
  await set(rewardRef, {
    ...reward,
    createdAt: Date.now(),
    active: true,
  });
  return rewardRef.key!;
}

export async function updateReward(
  householdId: string,
  rewardId: string,
  updates: Partial<Pick<Reward, "title" | "description" | "cost" | "icon">>
) {
  await update(ref(db, `rewards/${householdId}/${rewardId}`), updates);
}

export async function deleteReward(householdId: string, rewardId: string) {
  await update(ref(db, `rewards/${householdId}/${rewardId}`), { active: false });
}

export function subscribeToRewards(
  householdId: string,
  callback: (rewards: Reward[]) => void
): Unsubscribe {
  const rewardsRef = ref(db, `rewards/${householdId}`);
  return onValue(rewardsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const rewards: Reward[] = [];
    snapshot.forEach((child) => {
      rewards.push({ id: child.key!, ...child.val() } as Reward);
    });
    callback(rewards);
  });
}

export async function redeemReward(
  householdId: string,
  reward: Reward,
  uid: string,
  userName: string
) {
  const pointsRef = ref(db, `userProfiles/${uid}/totalPoints`);

  // Transaction to atomically deduct points
  const result = await runTransaction(pointsRef, (currentPoints: number | null) => {
    const points = currentPoints ?? 0;
    if (points < reward.cost) {
      return; // Abort transaction
    }
    return points - reward.cost;
  });

  if (!result.committed) {
    throw new Error("Nicht genügend Punkte");
  }

  // Create redemption entry
  const redemptionRef = push(ref(db, `redemptions/${householdId}`));
  const redemption: Omit<Redemption, "id"> = {
    rewardId: reward.id,
    rewardTitle: reward.title,
    redeemedBy: uid,
    redeemedByName: userName,
    cost: reward.cost,
    redeemedAt: Date.now(),
    status: "pending",
  };
  await set(redemptionRef, redemption);
  return redemptionRef.key!;
}

export function subscribeToRedemptions(
  householdId: string,
  callback: (redemptions: Redemption[]) => void
): Unsubscribe {
  const redemptionsRef = ref(db, `redemptions/${householdId}`);
  return onValue(redemptionsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const redemptions: Redemption[] = [];
    snapshot.forEach((child) => {
      redemptions.push({ id: child.key!, ...child.val() } as Redemption);
    });
    callback(redemptions);
  });
}

export async function updateRedemptionStatus(
  householdId: string,
  redemptionId: string,
  status: RedemptionStatus
) {
  // Get the redemption to check if we need to refund
  const redemptionSnapshot = await get(
    ref(db, `redemptions/${householdId}/${redemptionId}`)
  );
  if (!redemptionSnapshot.exists()) throw new Error("Einlösung nicht gefunden");
  const redemption = redemptionSnapshot.val() as Omit<Redemption, "id">;

  // Update status
  await update(ref(db, `redemptions/${householdId}/${redemptionId}`), { status });

  // Refund points on rejection
  if (status === "rejected") {
    const pointsRef = ref(db, `userProfiles/${redemption.redeemedBy}/totalPoints`);
    await runTransaction(pointsRef, (currentPoints: number | null) => {
      return (currentPoints ?? 0) + redemption.cost;
    });
  }
}

// ─── Pocket Money ────────────────────────────────────────────────

export async function setPocketMoneyRate(householdId: string, rate: number) {
  await update(ref(db, `households/${householdId}`), { pocketMoneyRate: rate });
}

export async function exchangeXpForMoney(
  householdId: string,
  uid: string,
  userName: string,
  xpAmount: number
) {
  // Get household rate
  const householdSnapshot = await get(ref(db, `households/${householdId}`));
  if (!householdSnapshot.exists()) throw new Error("Haushalt nicht gefunden");
  const household = householdSnapshot.val() as Omit<Household, "id">;
  const rate = household.pocketMoneyRate;
  if (!rate) throw new Error("Kein Wechselkurs eingestellt");

  const moneyAmount = Math.round(xpAmount * rate);

  // Atomically deduct XP
  const pointsRef = ref(db, `userProfiles/${uid}/totalPoints`);
  const result = await runTransaction(pointsRef, (currentPoints: number | null) => {
    const points = currentPoints ?? 0;
    if (points < xpAmount) return; // Abort
    return points - xpAmount;
  });

  if (!result.committed) {
    throw new Error("Nicht genügend Punkte");
  }

  // Add pocket money to user
  const pocketMoneyRef = ref(db, `userProfiles/${uid}/pocketMoney`);
  await runTransaction(pocketMoneyRef, (current: number | null) => {
    return (current ?? 0) + moneyAmount;
  });

  // Add history entry
  const historyRef = push(ref(db, `pocketMoneyHistory/${householdId}`));
  await set(historyRef, {
    uid,
    userName,
    xpAmount,
    moneyAmount,
    rate,
    createdAt: Date.now(),
  });
}

export function subscribeToPocketMoneyHistory(
  householdId: string,
  callback: (entries: PocketMoneyEntry[]) => void
): Unsubscribe {
  const historyRef = ref(db, `pocketMoneyHistory/${householdId}`);
  return onValue(historyRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const entries: PocketMoneyEntry[] = [];
    snapshot.forEach((child) => {
      entries.push({ id: child.key!, ...child.val() } as PocketMoneyEntry);
    });
    callback(entries);
  });
}

// ─── XP Transfer ─────────────────────────────────────────────────

export async function transferXp(
  householdId: string,
  fromUid: string,
  fromName: string,
  toUid: string,
  toName: string,
  amount: number,
  rewardId: string,
  rewardTitle: string
) {
  // Atomically deduct from sender
  const fromRef = ref(db, `userProfiles/${fromUid}/totalPoints`);
  const result = await runTransaction(fromRef, (current: number | null) => {
    const points = current ?? 0;
    if (points < amount) return; // Abort
    return points - amount;
  });

  if (!result.committed) {
    throw new Error("Nicht genügend Punkte");
  }

  // Add to recipient
  const toRef = ref(db, `userProfiles/${toUid}/totalPoints`);
  await runTransaction(toRef, (current: number | null) => {
    return (current ?? 0) + amount;
  });

  // Log transfer
  const transferRef = push(ref(db, `xpTransfers/${householdId}`));
  await set(transferRef, {
    fromUid,
    fromName,
    toUid,
    toName,
    amount,
    rewardId,
    rewardTitle,
    createdAt: Date.now(),
  });
}

export function subscribeToXpTransfers(
  householdId: string,
  callback: (transfers: XpTransfer[]) => void
): Unsubscribe {
  const transfersRef = ref(db, `xpTransfers/${householdId}`);
  return onValue(transfersRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const transfers: XpTransfer[] = [];
    snapshot.forEach((child) => {
      transfers.push({ id: child.key!, ...child.val() } as XpTransfer);
    });
    callback(transfers);
  });
}
