import { Card } from "@/components/ui/card";

interface PointsDisplayProps {
  points: number;
  label?: string;
}

export function PointsDisplay({ points, label = "Gesamtpunkte" }: PointsDisplayProps) {
  return (
    <Card padding="md" className="text-center">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
        {points} <span className="text-lg">XP</span>
      </p>
    </Card>
  );
}
