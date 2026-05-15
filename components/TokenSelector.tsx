// components/TokenSelector.tsx
// Token selector with live Metaplex metadata display
// Shows token image, name, and symbol for SPL tokens

"use client";

import { useEffect, useState } from "react";
import { Connection } from "@solana/web3.js";
import { getSolanaConnection } from "@/lib/solanaConnection";
import { fetchTokenMetadata, TokenMetadata } from "@/lib/solanaTokenMetadata";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TokenSelectorProps {
  selectedMint: string;
  onSelect: (mint: string, metadata: TokenMetadata | null) => void;
}

// Known tokens on Solana Devnet with fallback metadata
const KNOWN_TOKENS = [
  {
    mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    label: "USDC (Devnet)",
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMetadata() {
      setLoading(true);
      setError(null);

      try {
        const connection = getSolanaConnection();
        const meta = await fetchTokenMetadata(connection, selectedMint);
        if (!cancelled) {
          // Use fetched metadata or fallback for known tokens
          const fallback = KNOWN_TOKENS.find(
            (t) => t.mint === selectedMint
          )?.fallback;
          const resolved = meta || fallback || null;
          setMetadata(resolved);
          onSelect(selectedMint, resolved);
        }
      } catch (err: any) {
        if (!cancelled) {
          // On error, try fallback
          const fallback = KNOWN_TOKENS.find(
            (t) => t.mint === selectedMint
          )?.fallback;
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
  }, [selectedMint]);

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Token Image */}
          {metadata?.imageUri ? (
            <img
              src={metadata.imageUri}
              alt={metadata.name}
              className="h-12 w-12 rounded-full object-cover border border-white/10"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center">
              <span className="text-lg">❄️</span>
            </div>
          )}

          {/* Token Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {loading ? "Loading..." : metadata?.name || "Unknown Token"}
              </span>
              {metadata?.symbol && (
                <Badge variant="default">{metadata.symbol}</Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {selectedMint.slice(0, 8)}...{selectedMint.slice(-8)}
            </p>
          </div>

          {/* Status */}
          {loading && (
            <div className="h-5 w-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          )}
          {error && <Badge variant="error">Error</Badge>}
          {!loading && !error && metadata && (
            <Badge variant="success">Loaded</Badge>
          )}
        </div>

        {/* Token selector buttons */}
        <div className="flex gap-2 mt-3">
          {KNOWN_TOKENS.map((token) => (
            <button
              key={token.mint}
              onClick={() => {
                // Pass fallback metadata so parent can set mint + metadata
                onSelect(token.mint, token.fallback || null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedMint === token.mint
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              {token.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
