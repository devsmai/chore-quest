"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";

type TestResult = {
  name: string;
  status: "pending" | "success" | "error";
  message: string;
};

export default function FirebaseTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  function addResult(result: TestResult) {
    setResults((prev) => {
      const existing = prev.findIndex((r) => r.name === result.name);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = result;
        return updated;
      }
      return [...prev, result];
    });
  }

  async function runTests() {
    setResults([]);
    setRunning(true);

    // Test 1: Firebase App
    addResult({ name: "Firebase App", status: "pending", message: "Prüfe..." });
    try {
      const appName = auth.app.name;
      addResult({
        name: "Firebase App",
        status: "success",
        message: `App "${appName}" initialisiert`,
      });
    } catch (e) {
      addResult({
        name: "Firebase App",
        status: "error",
        message: String(e),
      });
      setRunning(false);
      return;
    }

    // Test 2: Auth - User erstellen
    const testEmail = `test-${Date.now()}@chore-quest.test`;
    const testPassword = "TestPass123!";

    addResult({ name: "Auth: Sign Up", status: "pending", message: "Erstelle Testuser..." });
    let uid = "";
    try {
      const cred = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      uid = cred.user.uid;
      addResult({
        name: "Auth: Sign Up",
        status: "success",
        message: `User erstellt: ${uid.slice(0, 8)}...`,
      });
    } catch (e) {
      addResult({
        name: "Auth: Sign Up",
        status: "error",
        message: String(e),
      });
      setRunning(false);
      return;
    }

    // Test 3: Auth State
    addResult({ name: "Auth: State", status: "pending", message: "Prüfe Auth State..." });
    try {
      const currentUser = await new Promise<string>((resolve, reject) => {
        const unsub = onAuthStateChanged(auth, (user) => {
          unsub();
          if (user) resolve(user.email || "unknown");
          else reject(new Error("Kein User eingeloggt"));
        });
      });
      addResult({
        name: "Auth: State",
        status: "success",
        message: `Eingeloggt als: ${currentUser}`,
      });
    } catch (e) {
      addResult({
        name: "Auth: State",
        status: "error",
        message: String(e),
      });
    }

    // Test 4: Realtime DB - Schreiben
    addResult({ name: "DB: Write", status: "pending", message: "Schreibe Testdaten..." });
    const testData = { test: true, timestamp: Date.now() };
    try {
      await set(ref(db, `connection-test/${uid}`), testData);
      addResult({
        name: "DB: Write",
        status: "success",
        message: `Geschrieben: ${JSON.stringify(testData)}`,
      });
    } catch (e) {
      addResult({
        name: "DB: Write",
        status: "error",
        message: String(e),
      });
    }

    // Test 5: Realtime DB - Lesen
    addResult({ name: "DB: Read", status: "pending", message: "Lese Testdaten..." });
    try {
      const snapshot = await get(ref(db, `connection-test/${uid}`));
      if (snapshot.exists()) {
        addResult({
          name: "DB: Read",
          status: "success",
          message: `Gelesen: ${JSON.stringify(snapshot.val())}`,
        });
      } else {
        addResult({
          name: "DB: Read",
          status: "error",
          message: "Keine Daten gefunden",
        });
      }
    } catch (e) {
      addResult({
        name: "DB: Read",
        status: "error",
        message: String(e),
      });
    }

    // Test 6: Sign Out
    addResult({ name: "Auth: Sign Out", status: "pending", message: "Logge aus..." });
    try {
      await signOut(auth);
      addResult({
        name: "Auth: Sign Out",
        status: "success",
        message: "Erfolgreich ausgeloggt",
      });
    } catch (e) {
      addResult({
        name: "Auth: Sign Out",
        status: "error",
        message: String(e),
      });
    }

    setRunning(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-8">
      <div className="w-full max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Firebase Connection Test
        </h1>

        <button
          onClick={runTests}
          disabled={running}
          className="rounded-lg bg-indigo-500 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
        >
          {running ? "Tests laufen..." : "Tests starten"}
        </button>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((r) => (
              <div
                key={r.name}
                className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <span className="mt-0.5 text-lg">
                  {r.status === "pending" && "⏳"}
                  {r.status === "success" && "✅"}
                  {r.status === "error" && "❌"}
                </span>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {r.name}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 break-all">
                    {r.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
