"use client";

import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4 dark:from-zinc-900 dark:to-zinc-800">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 text-3xl font-bold text-white shadow-lg">
            Q
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Konto erstellen
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Starte dein Chore Quest Abenteuer
          </p>
        </div>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Bereits ein Konto?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-500 hover:text-indigo-600"
          >
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
