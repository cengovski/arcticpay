// components/WalletModal.tsx
// Multi-chain wallet connection modal
// Supports EVM (MetaMask, Coinbase Wallet, WalletConnect) and Solana (Phantom, Solflare, Backpack)

"use client";

import { useCallback } from "react";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  onConnectEVM: (wallet: string) => Promise<void>;
  onConnectSolana: (wallet: string) => Promise<void>;
}

// ── EVM Wallets ──
const EVM_WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    desc: "Most popular EVM wallet",
    icon: "🦊",
    color: "#E2761B",
    available: () => typeof window !== "undefined" && !!(window as any).ethereum?.isMetaMask,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    desc: "By Coinbase exchange",
    icon: "🔵",
    color: "#0052FF",
    available: () => typeof window !== "undefined" && !!(window as any).ethereum?.isCoinbaseWallet,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    desc: "Scan with mobile wallet",
    icon: "🔗",
    color: "#3B99FC",
    available: () => true, // Always available (QR code flow)
  },
  {
    id: "injected",
    name: "Browser Wallet",
    desc: "Any injected EVM provider",
    icon: "🌐",
    color: "#6366F1",
    available: () => typeof window !== "undefined" && !!(window as any).ethereum,
  },
];

// ── Solana Wallets ──
const SOLANA_WALLETS = [
  {
    id: "phantom",
    name: "Phantom",
    desc: "Most popular Solana wallet",
    icon: "👻",
    color: "#AB9FF2",
    available: () => typeof window !== "undefined" && !!(window as any).solana?.isPhantom,
  },
  {
    id: "solflare",
    name: "Solflare",
    desc: "Secure Solana wallet",
    icon: "☀️",
    color: "#FC8E03",
    available: () => typeof window !== "undefined" && !!(window as any).solflare?.isSolflare,
  },
  {
    id: "backpack",
    name: "Backpack",
    desc: "xNFT-enabled wallet",
    icon: "🎒",
    color: "#E3405F",
    available: () => typeof window !== "undefined" && !!(window as any).backpack?.isBackpack,
  },
  {
    id: "injected_sol",
    name: "Browser Wallet",
    desc: "Any injected Solana provider",
    icon: "🌐",
    color: "#9945FF",
    available: () => typeof window !== "undefined" && !!(window as any).solana,
  },
];

export function WalletModal({
  open,
  onClose,
  onConnectEVM,
  onConnectSolana,
}: WalletModalProps) {
  const handleEVM = useCallback(
    async (walletId: string) => {
      await onConnectEVM(walletId);
      onClose();
    },
    [onConnectEVM, onClose]
  );

  const handleSolana = useCallback(
    async (walletId: string) => {
      await onConnectSolana(walletId);
      onClose();
    },
    [onConnectSolana, onClose]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md card-surface p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--arctic-muted)] hover:text-white transition-colors text-xl leading-none cursor-pointer"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold text-white mb-1">Connect Wallet</h2>
        <p className="text-sm text-[var(--arctic-muted)] mb-6">
          Choose your wallet to start transferring USDC
        </p>

        {/* ── EVM Section ── */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--arctic-muted)]">
              EVM Chains
            </span>
            <div className="flex-1 h-px bg-[var(--arctic-border)]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EVM_WALLETS.map((w) => {
              const isAvailable = w.available();
              return (
                <button
                  key={w.id}
                  onClick={() => isAvailable && handleEVM(w.id)}
                  disabled={!isAvailable}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    isAvailable
                      ? "border-[var(--arctic-border)] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
                      : "border-transparent bg-white/[0.01] opacity-40 cursor-not-allowed"
                  }`}
                >
                  <span className="text-2xl leading-none">{w.icon}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {w.name}
                    </div>
                    <div className="text-[10px] text-[var(--arctic-muted)] truncate">
                      {isAvailable ? w.desc : "Not installed"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Solana Section ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--arctic-muted)]">
              Solana
            </span>
            <div className="flex-1 h-px bg-[var(--arctic-border)]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SOLANA_WALLETS.map((w) => {
              const isAvailable = w.available();
              return (
                <button
                  key={w.id}
                  onClick={() => isAvailable && handleSolana(w.id)}
                  disabled={!isAvailable}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    isAvailable
                      ? "border-[var(--arctic-border)] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
                      : "border-transparent bg-white/[0.01] opacity-40 cursor-not-allowed"
                  }`}
                >
                  <span className="text-2xl leading-none">{w.icon}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {w.name}
                    </div>
                    <div className="text-[10px] text-[var(--arctic-muted)] truncate">
                      {isAvailable ? w.desc : "Not installed"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-[var(--arctic-muted)] text-center mt-5">
          By connecting, you agree to the Terms of Service
        </p>
      </div>
    </div>
  );
}
