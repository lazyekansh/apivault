"use client";

import { useState, useCallback } from "react";
import { formatDate, maskKey } from "@/lib/utils";

interface Pass {
  id: string;
  key: string;
  label: string | null;
  ipAddress: string | null;
  isActive: boolean;
  createdAt: Date | string;
  _count: { subKeys: number };
}

interface Props {
  initialPasses: Pass[];
}

export default function AdminClient({ initialPasses }: Props) {
  const [passes, setPasses] = useState<Pass[]>(initialPasses);
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [newPassKey, setNewPassKey] = useState<string | null>(null);

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

  async function createPass() {
    setCreating(true);
    setCreateError("");
    setNewPassKey(null);
    try {
      const res = await fetch("/api/admin/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error ?? "Failed to create pass");
        return;
      }
      setPasses((prev) => [{ ...data.pass, _count: { subKeys: 0 } }, ...prev]);
      setNewPassKey(data.pass.key);
      setNewLabel("");
    } catch {
      setCreateError("Network error");
    } finally {
      setCreating(false);
    }
  }

  async function togglePass(id: string, current: boolean) {
    const res = await fetch(`/api/admin/passes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) {
      setPasses((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !current } : p))
      );
    }
  }

  async function resetIp(id: string) {
    const res = await fetch(`/api/admin/passes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetIp: true }),
    });
    if (res.ok) {
      setPasses((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ipAddress: null } : p))
      );
    }
  }

  async function deletePass(id: string) {
    if (!confirm("Delete this pass and all its sub-keys? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/passes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPasses((prev) => prev.filter((p) => p.id !== id));
    }
  }

  const activeCount = passes.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="vault-card p-5">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">Total Passes</p>
          <p className="text-3xl font-display font-semibold text-zinc-100">{passes.length}</p>
        </div>
        <div className="vault-card p-5">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">Active</p>
          <p className="text-3xl font-display font-semibold text-teal-400">{activeCount}</p>
        </div>
        <div className="vault-card p-5">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">Revoked</p>
          <p className="text-3xl font-display font-semibold text-zinc-500">
            {passes.length - activeCount}
          </p>
        </div>
      </div>

      <div className="vault-card p-5">
        <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Generate Pass</h2>
        <div className="flex gap-2">
          <input
            type="text"
            className="vault-input flex-1"
            placeholder="Label (optional, e.g. 'client-name')"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createPass()}
            disabled={creating}
            maxLength={80}
          />
          <button
            onClick={createPass}
            disabled={creating}
            className="vault-btn-primary whitespace-nowrap"
          >
            {creating ? "Creating..." : "+ New Pass"}
          </button>
        </div>
        {createError && (
          <p className="text-xs text-red-400 mt-2">{createError}</p>
        )}

        {newPassKey && (
          <div className="mt-4 bg-teal-500/5 border border-teal-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-teal-400 font-medium uppercase tracking-widest">
                ✓ Pass Created — Save this key now
              </p>
              <button
                onClick={() => copyToClipboard(newPassKey, "new-pass")}
                className="text-xs text-zinc-500 hover:text-teal-400 transition-colors"
              >
                {copiedId === "new-pass" ? "Copied!" : "Copy"}
              </button>
            </div>
            <code className="text-sm text-teal-300 font-mono break-all">{newPassKey}</code>
            <p className="text-xs text-zinc-600 mt-2">
              This key will not be shown in full again.
            </p>
          </div>
        )}
      </div>

      <div className="vault-card overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest">All Passes</h2>
          <span className="text-xs text-zinc-700">{passes.length} total</span>
        </div>

        {passes.length === 0 ? (
          <div className="px-5 py-12 text-center text-zinc-700 text-sm">
            No passes yet. Create one above.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {passes.map((pass) => (
              <div key={pass.id} className="px-5 py-4">
                <div className="flex items-start gap-4">
                  <span
                    className={`status-dot mt-1.5 flex-shrink-0 ${
                      pass.isActive ? "status-dot-active" : "status-dot-inactive"
                    }`}
                  />

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      {pass.label && (
                        <span className="text-sm font-medium text-zinc-300">{pass.label}</span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                          pass.isActive
                            ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                            : "bg-zinc-800 text-zinc-600 border border-zinc-700"
                        }`}
                      >
                        {pass.isActive ? "active" : "revoked"}
                      </span>
                      <span className="text-xs text-zinc-700">
                        {pass._count.subKeys} sub-key{pass._count.subKeys !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs text-zinc-700">{formatDate(pass.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="text-xs text-zinc-600 font-mono">
                        {revealedIds.has(pass.id) ? pass.key : maskKey(pass.key)}
                      </code>
                      <button
                        onClick={() => toggleReveal(pass.id)}
                        className="text-zinc-700 hover:text-zinc-400 transition-colors"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {revealedIds.has(pass.id) ? (
                            <>
                              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </>
                          ) : (
                            <>
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </>
                          )}
                        </svg>
                      </button>
                      <button
                        onClick={() => copyToClipboard(pass.key, pass.id)}
                        className="text-zinc-700 hover:text-teal-400 transition-colors"
                      >
                        {copiedId === pass.id ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-700">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                      <span className="text-xs font-mono text-zinc-600">
                        {pass.ipAddress ?? (
                          <span className="text-zinc-700 italic">unbound</span>
                        )}
                      </span>
                      {pass.ipAddress && (
                        <button
                          onClick={() => resetIp(pass.id)}
                          className="text-xs text-zinc-700 hover:text-amber-400 transition-colors"
                          title="Reset IP lock"
                        >
                          reset
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => togglePass(pass.id, pass.isActive)}
                      className={`vault-btn-ghost text-xs px-3 py-1.5 ${
                        pass.isActive
                          ? "text-zinc-500 hover:text-amber-400"
                          : "text-zinc-600 hover:text-teal-400"
                      }`}
                    >
                      {pass.isActive ? "Revoke" : "Activate"}
                    </button>

                    <button
                      onClick={() => deletePass(pass.id)}
                      className="vault-btn-danger px-3 py-1.5 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
