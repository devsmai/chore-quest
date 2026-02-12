"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/hooks/use-role";

interface Tab {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const allTabs: Tab[] = [
  { href: "/dashboard", label: "Aufgaben", icon: "📋" },
  { href: "/chores/new", label: "Neu", icon: "➕", adminOnly: true },
  { href: "/rewards", label: "Belohnungen", icon: "🎁" },
  { href: "/pocket-money", label: "Taschengeld", icon: "💰" },
  { href: "/stats", label: "Statistik", icon: "🏆" },
];

export function NavBar() {
  const pathname = usePathname();
  const { isAdmin } = useRole();

  const tabs = allTabs.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-zinc-200 bg-white/90 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
