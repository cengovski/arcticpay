// components/TokenSelector.tsx
// Token selector with live Metaplex metadata display
// Clean card layout with proper spacing

"use client";

import { useEffect, useState } from "react";
import { getSolanaConnection } from "@/lib/solanaConnection";
import { fetchTokenMetadata, TokenMetadata } from "@/lib/solanaTokenMetadata";
import { CheckCircle2, Loader2 } from "lucide-react";

interface TokenSelectorProps {
  selectedMint: string;
  onSelect: (mint: string, metadata: TokenMetadata | null) => void;
}

// Known tokens with fallback metadata (for tokens without on-chain Metaplex metadata)
const KNOWN_TOKENS = [
  {
    mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    label: "USDC",
    subtitle: "Devnet",
    fallback: {
      mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
      name: "USD Coin",
      symbol: "USDC",
      uri: "",
      imageUri: null,
      description: "USDC on Solana Devnet",
    },
  },
];

export function TokenSelector({ selectedMint, onSelect }: TokenSelectorProps) {
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMetadata() {
      setLoading(true);

      try {
        const connection = getSolanaConnection();
        const meta = await fetchTokenMetadata(connection, selectedMint);
        if (!cancelled) {
          const fallback = KNOWN_TOKENS.find((t) => t.mint === selectedMint)?.fallback;
          const resolved = meta || fallback || null;
          setMetadata(resolved);
          onSelect(selectedMint, resolved);
        }
      } catch {
        if (!cancelled) {
          const fallback = KNOWN_TOKENS.find((t) => t.mint === selectedMint)?.fallback;
          setMetadata(fallback || null);
          onSelect(selectedMint, fallback || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMetadata();
    return () => {
      cancelled = true;
    };
  }, [selectedMint, onSelect]);

  const selectedToken = KNOWN_TOKENS.find((t) => t.mint === selectedMint);

  return (
    <div className="card-surface p-4">
      <div className="flex items-center gap-4">
        {/* Token Icon */}
        {metadata?.imageUri ? (
          <img
            src={metadata.imageUri}
            alt={metadata.name}
            className="h-11 w-11 rounded-full object-cover border border-white/10 shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center shrink-0">
            <span className="text-lg">❄️</span>
          </div>
        )}

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              {loading ? "Loading..." : metadata?.name || "Unknown Token"}
            </span>
            {metadata?.symbol && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/[0.06] text-[var(--arctic-muted)]">
                {metadata.symbol}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--arctic-muted)] font-mono mt-0.5">
            {selectedMint.slice(0, 8)}...{selectedMint.slice(-8)}
          </p>
        </div>

        {/* Status */}
        <div className="shrink-0">
          {loading ? (
            <Loader2 className="h-4 w-4 text-[var(--arctic-muted)] animate-spin" />
          ) : metadata ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : null}
        </div>
      </div>

      {/* Token Buttons */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--arctic-border)]">
        {KNOWN_TOKENS.map((token) => (
          <button
            key={token.mint}
            onClick={() => onSelect(token.mint, token.fallback || null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedMint === token.mint
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                : "bg-white/[0.03] text-[var(--arctic-muted)] border border-transparent hover:bg-white/[0.06]"
            }`}
          >
            {token.label}
            <span className="ml-1 opacity-50">{token.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
