// app/page.tsx
// Arctic Pay — Main entry point
// Handles wallet connection (EVM + Solana) and renders the dashboard

"use client";

import { useState, useCallback } from "react";
import { Dashboard } from "@/components/Dashboard";
import { SnowEffect } from "@/components/SnowEffect";
import { WalletModal } from "@/components/WalletModal";
import { Snowflake, Zap, Shield, ArrowRightLeft } from "lucide-react";

type WalletType = "evm" | "solana" | null;

interface ConnectedWallet {
  type: WalletType;
  address: string;
  label: string;
}

export default function HomePage() {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ── EVM Connection ──
  const connectEVM = useCallback(async (walletId: string) => {
    setConnecting(true);
    try {
      const eth = (window as any).ethereum;
      if (!eth) {
        alert("No EVM wallet found. Please install MetaMask or Coinbase Wallet.");
        return;
      }

      let accounts: string[] = [];

      if (walletId === "metamask" && eth.isMetaMask) {
        accounts = await eth.request({ method: "eth_requestAccounts" });
      } else if (walletId === "coinbase" && eth.isCoinbaseWallet) {
        accounts = await eth.request({ method: "eth_requestAccounts" });
      } else if (walletId === "walletconnect") {
        // In production: trigger WalletConnect QR flow
        accounts = await eth.request({ method: "eth_requestAccounts" });
      } else {
        // Generic injected
        accounts = await eth.request({ method: "eth_requestAccounts" });
      }

      if (accounts?.length > 0) {
        setWallet({
          type: "evm",
          address: accounts[0],
          label: `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    } catch (err: any) {
      console.error("EVM connection failed:", err);
      if (err.code !== 4001) alert(`Connection failed: ${err.message}`);
    } finally {
      setConnecting(false);
    }
  }, []);

  // ── Solana Connection ──
  const connectSolana = useCallback(async (walletId: string) => {
    setConnecting(true);
    try {
      let provider: any = null;

      if (walletId === "phantom" && (window as any).solana?.isPhantom) {
        provider = (window as any).solana;
      } else if (walletId === "solflare" && (window as any).solflare?.isSolflare) {
        provider = (window as any).solflare;
      } else if (walletId === "backpack" && (window as any).backpack?.isBackpack) {
        provider = (window as any).backpack;
      } else {
        // Generic injected
        provider = (window as any).solana;
      }

      if (!provider) {
        alert("No Solana wallet found. Please install Phantom or Solflare.");
        return;
      }

      const resp = await provider.connect();
      const addr = resp.publicKey.toString();

      setWallet({
        type: "solana",
        address: addr,
        label: `${addr.slice(0, 4)}...${addr.slice(-4)}`,
      });
    } catch (err: any) {
      console.error("Solana connection failed:", err);
      if (err.code !== 4001) alert(`Connection failed: ${err.message}`);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    try {
      (window as any).solana?.disconnect?.();
    } catch {
      // ignore
    }
  }, []);

  return (
    <>
      <SnowEffect />

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 glass border-b border-[var(--arctic-border)]">
        <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-5">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--arctic-cyan)] to-[var(--arctic-blue)] flex items-center justify-center">
              <Snowflake className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gradient">Arctic Pay</span>
          </div>

          {/* Wallet */}
          {wallet ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-[var(--arctic-border)]">
                <div
                  className={`w-2 h-2 rounded-full ${
                    wallet.type === "evm" ? "bg-indigo-400" : "bg-purple-400"
                  }`}
                />
                <span className="text-sm font-mono text-[var(--arctic-text)]">
                  {wallet.label}
                </span>
              </div>
              <button
                onClick={disconnect}
                className="text-xs text-[var(--arctic-muted)] hover:text-white transition-colors px-2 py-1 cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              disabled={connecting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--arctic-cyan)] to-[var(--arctic-blue)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {connecting ? (
                <>
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Snowflake className="h-3.5 w-3.5" />
                  Connect Wallet
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-5xl mx-auto px-5 py-10">
        {/* Hero */}
        <div className="text-center mb-14 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Fast Cross-Chain
            <br />
            <span className="text-gradient">USDC Transfers</span>
          </h1>
          <p className="text-base text-[var(--arctic-muted)] max-w-xl mx-auto leading-relaxed">
            Transfer USDC across Solana, ARC, and Ethereum with Circle CCTP v2,
            Iris fast finality, and onchain Travel Rule compliance.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-7">
            {[
              { icon: <Zap className="h-3 w-3" />, label: "Fast Transfer (Iris)", color: "amber" },
              { icon: <Shield className="h-3 w-3" />, label: "Gasless Paymaster", color: "emerald" },
              { icon: <ArrowRightLeft className="h-3 w-3" />, label: "CCTP v2 Bridge", color: "blue" },
            ].map((badge) => (
              <span
                key={badge.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                  badge.color === "amber"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                    : badge.color === "emerald"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-300"
                }`}
              >
                {badge.icon}
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard */}
        <Dashboard walletType={wallet?.type ?? null} />
      </main>

      {/* ── Wallet Modal ── */}
      <WalletModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConnectEVM={connectEVM}
        onConnectSolana={connectSolana}
      />
    </>
  );
}
