"use client";

import { useState, useRef } from "react";
import { useAppStore } from "@/store/app-store";
import { completeChore, uploadChorePhoto } from "@/lib/firebase-service";
import { Button } from "@/components/ui/button";
import type { Chore } from "@/types";

interface CompleteChoreDialogProps {
  chore: Chore;
  onClose: () => void;
  onCompleted: () => void;
}

export function CompleteChoreDialog({
  chore,
  onClose,
  onCompleted,
}: CompleteChoreDialogProps) {
  const user = useAppStore((s) => s.user);
  const userProfile = useAppStore((s) => s.userProfile);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit() {
    if (!user || !userProfile?.householdId) return;
    setLoading(true);
    try {
      let photoUrl: string | undefined;
      if (photo) {
        photoUrl = await uploadChorePhoto(
          userProfile.householdId,
          chore.id,
          photo
        );
      }
      await completeChore(
        userProfile.householdId,
        chore.id,
        user.uid,
        user.displayName || "Unbekannt",
        note || undefined,
        photoUrl
      );
      onCompleted();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-xl sm:rounded-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {chore.title} erledigen
        </h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          +{chore.points} XP
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Notiz (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Was hast du gemacht?"
              rows={3}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Foto (optional)
            </label>
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Vorschau"
                  className="h-40 w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 py-6 text-sm text-zinc-500 transition-colors hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-600 dark:text-zinc-400"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Foto aufnehmen
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Abbrechen
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Wird gespeichert..." : "Erledigt!"}
          </Button>
        </div>
      </div>
    </div>
  );
}
