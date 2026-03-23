"use client";

import { useRouter } from "next/navigation";

export default function DashboardNav() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="border-b border-zinc-900 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="rgba(45,212,191,0.1)" />
            <path
              d="M14 6C10.686 6 8 8.686 8 12v1H6v9h16v-9h-2v-1c0-3.314-2.686-6-6-6zm0 2c2.21 0 4 1.79 4 4v1h-8v-1c0-2.21 1.79-4 4-4zm0 7a2 2 0 110 4 2 2 0 010-4z"
              fill="#2dd4bf"
            />
          </svg>
          <span className="font-display text-sm font-semibold tracking-wide text-zinc-100">
            API Vault
          </span>
        </div>

        <button onClick={handleLogout} className="vault-btn-ghost text-xs">
          Sign out
        </button>
      </div>
    </nav>
  );
}
