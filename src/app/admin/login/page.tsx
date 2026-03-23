"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Authentication failed");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-in">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="rgba(239,68,68,0.1)" />
              <path
                d="M14 4a4 4 0 00-4 4v2H8a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V12a2 2 0 00-2-2h-2V8a4 4 0 00-4-4zm0 2a2 2 0 012 2v2h-4V8a2 2 0 012-2zm0 9a2 2 0 110 4 2 2 0 010-4z"
                fill="#f87171"
              />
            </svg>
            <span className="font-display text-lg font-semibold tracking-wide text-zinc-100">
              Admin Access
            </span>
          </div>
          <p className="text-zinc-500 text-sm">Restricted area. Authorized personnel only.</p>
        </div>

        <form onSubmit={handleSubmit} className="vault-card p-6 space-y-4 border-red-500/10">
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-2">
              Admin Password
            </label>
            <input
              type="password"
              className="vault-input"
              placeholder="••••••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded px-3 py-2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 0a6 6 0 100 12A6 6 0 006 0zm0 8.5a.75.75 0 110 1.5.75.75 0 010-1.5zm.75-5v4a.75.75 0 01-1.5 0v-4a.75.75 0 011.5 0z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full bg-red-500/80 hover:bg-red-500 text-white font-medium text-sm px-4 py-2.5 rounded transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Enter Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
