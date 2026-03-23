"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [passKey, setPassKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!passKey.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passKey: passKey.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Authentication failed");
        return;
      }

      router.push("/dashboard");
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
              <rect width="28" height="28" rx="6" fill="rgba(45,212,191,0.1)" />
              <path
                d="M14 6C10.686 6 8 8.686 8 12v1H6v9h16v-9h-2v-1c0-3.314-2.686-6-6-6zm0 2c2.21 0 4 1.79 4 4v1h-8v-1c0-2.21 1.79-4 4-4zm0 7a2 2 0 110 4 2 2 0 010-4z"
                fill="#2dd4bf"
              />
            </svg>
            <span className="font-display text-lg font-semibold tracking-wide text-zinc-100">
              API Vault
            </span>
          </div>
          <p className="text-zinc-500 text-sm">Enter your access pass to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="vault-card p-6 space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-2">
              Access Pass
            </label>
            <input
              type="password"
              className="vault-input"
              placeholder="vlt_pass_••••••••••••••••"
              value={passKey}
              onChange={(e) => setPassKey(e.target.value)}
              autoComplete="off"
              spellCheck={false}
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
            disabled={loading || !passKey.trim()}
            className="vault-btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Authenticating...
              </span>
            ) : (
              "Access Vault"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-700 mt-6">
          IP address will be locked on first login
        </p>
      </div>
    </div>
  );
}
