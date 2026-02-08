interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="text-4xl">{icon}</span>
      <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
        {title}
      </h3>
      {description && (
        <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
