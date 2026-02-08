export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800">
      <main className="flex flex-col items-center gap-8 px-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500 text-4xl text-white shadow-lg">
          Q
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Chore Quest
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Gamified household chore management
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            PWA Ready
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            Firebase
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            Zustand
          </span>
        </div>
      </main>
    </div>
  );
}
