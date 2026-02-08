import { Card } from "@/components/ui/card";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  return (
    <Card padding="md">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Aktuelle Streak
          </p>
          <p className="text-2xl font-bold text-amber-500">
            {currentStreak > 0 ? `🔥 ${currentStreak}` : "—"}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {currentStreak === 1 ? "Tag" : "Tage"}
          </p>
        </div>
        <div className="h-10 w-px bg-zinc-200 dark:bg-zinc-700" />
        <div className="text-center flex-1">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Beste Streak
          </p>
          <p className="text-2xl font-bold text-purple-500">
            {longestStreak > 0 ? `⭐ ${longestStreak}` : "—"}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {longestStreak === 1 ? "Tag" : "Tage"}
          </p>
        </div>
      </div>
    </Card>
  );
}
