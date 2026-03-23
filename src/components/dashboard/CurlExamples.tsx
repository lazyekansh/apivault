"use client";

import { useState } from "react";

interface Props {
  activeKey?: string;
}

const PLACEHOLDER = "vlt_sk_your_sub_key_here";

export default function CurlExamples({ activeKey }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const key = activeKey ?? PLACEHOLDER;

  const examples = [
    {
      id: "chat",
      label: "Chat Completion",
      description: "POST request proxied to target API",
      curl: `curl -X POST https://YOUR_VAULT_DOMAIN/api/proxy/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${key}" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "user", "content": "Hello!" }
    ]
  }'`,
    },
    {
      id: "list",
      label: "List Models",
      description: "GET request through proxy",
      curl: `curl https://YOUR_VAULT_DOMAIN/api/proxy/v1/models \\
  -H "x-api-key: ${key}"`,
    },
    {
      id: "embed",
      label: "Embeddings",
      description: "Create vector embeddings",
      curl: `curl -X POST https://YOUR_VAULT_DOMAIN/api/proxy/v1/embeddings \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${key}" \\
  -d '{
    "model": "text-embedding-3-small",
    "input": "The vault keeps your keys safe."
  }'`,
    },
  ];

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  }

  function highlight(curl: string) {
    return curl
      .replace(/(curl)/g, '<span class="text-zinc-400">$1</span>')
      .replace(/(-X\s+\w+)/g, '<span class="text-amber-400">$1</span>')
      .replace(/(https?:\/\/[^\s\\]+)/g, '<span class="text-zinc-300">$1</span>')
      .replace(/(-H\s+"[^"]*")/g, (m) => {
        const header = m.replace(/-H\s+"/, '').replace(/"$/, '');
        const [name, ...rest] = header.split(': ');
        const value = rest.join(': ');
        if (name === 'x-api-key') {
          return `-H "<span class="text-teal-400">${name}</span>: <span class="text-teal-300">${value}</span>"`;
        }
        return `-H "<span class="text-zinc-400">${name}</span>: <span class="text-zinc-300">${value}</span>"`;
      })
      .replace(/(-d\s+')/g, '<span class="text-zinc-500">$1</span>')
      .replace(/(\\')/g, '<span class="text-zinc-500">\'</span>');
  }

  return (
    <div className="vault-card overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800">
        <h2 className="text-xs text-zinc-500 uppercase tracking-widest">Usage Examples</h2>
        {!activeKey && (
          <p className="text-xs text-amber-500/70 mt-1">
            Generate and activate a sub-key to see your actual key in these examples.
          </p>
        )}
      </div>

      <div className="divide-y divide-zinc-800/60">
        {examples.map((ex) => (
          <div key={ex.id} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-medium text-zinc-300">{ex.label}</span>
                <p className="text-xs text-zinc-600 mt-0.5">{ex.description}</p>
              </div>
              <button
                onClick={() => copy(ex.id, ex.curl)}
                className="vault-btn-ghost flex items-center gap-1.5 text-xs"
              >
                {copied === ex.id ? (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-teal-400">Copied</span>
                  </>
                ) : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="code-block">
              <pre
                className="text-zinc-500 whitespace-pre-wrap break-all leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlight(ex.curl) }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
