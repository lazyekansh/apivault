"use client";

import { useState, useCallback } from "react";
import { formatDate, maskKey } from "@/lib/utils";
import CurlExamples from "./CurlExamples";

interface Pass {
  id: string;
  label: string | null;
  ipAddress: string | null;
  isActive: boolean;
  createdAt: Date | string;
}

interface SubKey {
  id: string;
  key: string;
  name: string | null;
  isActive: boolean;
  createdAt: Date | string;
}

interface Props {
  pass: Pass | null;
  initialSubKeys: SubKey[];
}

export default function DashboardClient({ pass, initialSubKeys }: Props) {
  const [subKeys, setSubKeys] = useState<SubKey[]>(initialSubKeys);
  const [newKeyName, setNewKeyName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  }, []);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  async function generateKey() {
    setGenerating(true);
    setGenError("");
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenError(data.error ?? "Failed to generate key");
        return;
      }
      setSubKeys((prev) => [data.subKey, ...prev]);
      setNewKeyName("");
    } catch {
      setGenError("Network error");
    } finally {
      setGenerating(false);
    }
  }

  async function toggleKey(id: string, current: boolean) {
    const res = await fetch(`/api/keys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) {
      const data = await res.json();
      setSubKeys((prev) => prev.map((k) => (k.id === id ? data.subKey : k)));
    }
  }

  async function deleteKey(id: string) {
    const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSubKeys((prev) => prev.filter((k) => k.id !== id));
    }
  }

  const activeKey = subKeys.find((k) => k.isActive);

  if (!pass) {
    return (
      <div className="text-center py-20 text-zinc-600">
        <p>Session data unavailable. Please re-login.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="vault-card p-5">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">Status</p>
          <div className="flex items-center gap-2">
            <span className={`status-dot ${pass.isActive ? "status-dot-active" : "status-dot-inactive"}`} />
            <span className={`text-sm font-medium ${pass.isActive ? "text-teal-400" : "text-zinc-500"}`}>
              {pass.isActive ? "Active" : "Revoked"}
            </span>
          </div>
          {pass.label && (
            <p className="text-xs text-zinc-600 mt-2 truncate">{pass.label}</p>
          )}
        </div>

        <div className="vault-card p-5">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">Locked IP</p>
          <p className="text-sm font-mono text-zinc-300">
            {pass.ipAddress ?? (
              <span className="text-amber-500/70">Pending first login</span>
            )}
          </p>
        </div>

        <div className="vault-card p-5">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">Sub-Keys</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-semibold text-zinc-100">
              {subKeys.filter((k) => k.isActive).length}
            </span>
            <span className="text-xs text-zinc-600">active / {subKeys.length} total</span>
          </div>
        </div>
      </div>

      <div className="vault-card p-5">
        <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Generate Sub-Key</h2>
        <div className="flex gap-2">
          <input
            type="text"
            className="vault-input flex-1"
            placeholder="Key label (optional)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generateKey()}
            disabled={generating}
            maxLength={50}
          />
          <button
            onClick={generateKey}
            disabled={generating}
            className="vault-btn-primary whitespace-nowrap"
          >
            {generating ? "Generating..." : "+ Generate"}
          </button>
        </div>
        {genError && (
          <p className="text-xs text-red-400 mt-2">{genError}</p>
        )}
      </div>

      <div className="vault-card overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest">Sub-Keys</h2>
          <span className="text-xs text-zinc-700">{subKeys.length} total</span>
        </div>

        {subKeys.length === 0 ? (
          <div className="px-5 py-12 text-center text-zinc-700 text-sm">
            No sub-keys yet. Generate one above.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {subKeys.map((sk) => (
              <div key={sk.id} className="px-5 py-4 flex items-center gap-4">
                <span className={`status-dot flex-shrink-0 ${sk.isActive ? "status-dot-active" : "status-dot-inactive"}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {sk.name && (
                      <span className="text-xs text-zinc-400 font-medium">{sk.name}</span>
                    )}
                    <span className="text-xs text-zinc-700">{formatDate(sk.createdAt)}</span>
                  </div>
                  <code className="text-xs text-zinc-500 font-mono block truncate">
                    {revealedIds.has(sk.id) ? sk.key : maskKey(sk.key)}
                  </code>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleReveal(sk.id)}
                    className="vault-btn-ghost p-2"
                    title={revealedIds.has(sk.id) ? "Hide" : "Reveal"}
                  >
                    {revealedIds.has(sk.id) ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => copyToClipboard(sk.key, sk.id)}
                    className="vault-btn-ghost p-2"
                    title="Copy key"
                  >
                    {copiedId === sk.id ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => toggleKey(sk.id, sk.isActive)}
                    className="vault-btn-ghost p-2 text-xs"
                    title={sk.isActive ? "Revoke" : "Activate"}
                  >
                    {sk.isActive ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2">
                        <path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z" />
                        <path d="M8 12l3 3 5-5" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => deleteKey(sk.id)}
                    className="vault-btn-danger p-2"
                    title="Delete key"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CurlExamples activeKey={activeKey?.key} />
    </div>
  );
}
