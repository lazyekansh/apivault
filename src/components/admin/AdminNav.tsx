"use client";

import { useRouter } from "next/navigation";

export default function AdminNav() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="border-b border-zinc-900 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="rgba(239,68,68,0.1)" />
            <path
              d="M14 4a4 4 0 00-4 4v2H8a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V12a2 2 0 00-2-2h-2V8a4 4 0 00-4-4zm0 2a2 2 0 012 2v2h-4V8a2 2 0 012-2zm0 9a2 2 0 110 4 2 2 0 010-4z"
              fill="#f87171"
            />
          </svg>
          <span className="font-display text-sm font-semibold tracking-wide text-zinc-100">
            API Vault
          </span>
          <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-mono">
            ADMIN
          </span>
        </div>

        <button onClick={handleLogout} className="vault-btn-ghost text-xs">
          Sign out
        </button>
      </div>
    </nav>
  );
}
