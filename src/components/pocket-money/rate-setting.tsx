"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { setPocketMoneyRate } from "@/lib/firebase-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function RateSetting() {
  const household = useAppStore((s) => s.household);
  const currentRate = household?.pocketMoneyRate ?? 0;

  const [rateInput, setRateInput] = useState(currentRate.toString());
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!household) return;
    const rate = parseFloat(rateInput);
    if (isNaN(rate) || rate <= 0) return;
    setLoading(true);
    try {
      await setPocketMoneyRate(household.id, rate);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  // Preview: e.g. 0.5 Cent/XP => 1000 XP = 5.00 €
  const previewRate = parseFloat(rateInput);
  const preview =
    !isNaN(previewRate) && previewRate > 0
      ? `1000 XP = ${((1000 * previewRate) / 100).toFixed(2)} €`
      : null;

  return (
    <Card>
      <h3 className="mb-3 text-base font-bold text-zinc-900 dark:text-zinc-100">
        Wechselkurs einstellen
      </h3>
      <div className="flex flex-col gap-3">
        <Input
          label="Cent pro XP"
          type="number"
          min={0.01}
          step={0.01}
          value={rateInput}
          onChange={(e) => {
            setRateInput(e.target.value);
            setSaved(false);
          }}
          placeholder="z.B. 0.5"
        />
        {preview && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {preview}
          </p>
        )}
        <Button onClick={handleSave} disabled={loading}>
          {saved ? "Gespeichert!" : loading ? "Wird gespeichert..." : "Kurs speichern"}
        </Button>
      </div>
    </Card>
  );
}
