// components/Dashboard.tsx
// Main dashboard with tabbed navigation
// Clean visual hierarchy with proper spacing

"use client";

import { useState } from "react";
import { TokenSelector } from "@/components/TokenSelector";
import { TransferForm } from "@/components/TransferForm";
import { BridgePanel } from "@/components/BridgePanel";
import { TokenMetadata } from "@/lib/solanaTokenMetadata";
import { Activity, Zap, TrendingUp, Shield, CheckCircle2 } from "lucide-react";

type Tab = "transfer" | "bridge" | "stats";

interface DashboardProps {
  walletType: "evm" | "solana" | null;
}

export function Dashboard({ walletType }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("transfer");
  const [selectedMint, setSelectedMint] = useState(
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
  );
  const [selectedMetadata, setSelectedMetadata] = useState<TokenMetadata | null>(null);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "transfer", label: "Transfer", icon: <Activity className="h-4 w-4" /> },
    { id: "bridge", label: "Bridge", icon: <Zap className="h-4 w-4" /> },
    { id: "stats", label: "Stats", icon: <TrendingUp className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Token Selector */}
      <TokenSelector
        selectedMint={selectedMint}
        onSelect={(mint, meta) => {
          setSelectedMint(mint);
          setSelectedMetadata(meta);
        }}
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-[var(--arctic-border)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-white/[0.08] text-white shadow-sm"
                : "text-[var(--arctic-muted)] hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "transfer" && (
          <TransferForm mint={selectedMint} decimals={6} walletType={walletType} />
        )}

        {activeTab === "bridge" && <BridgePanel walletType={walletType} />}

        {activeTab === "stats" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Fast Transfer */}
            <div className="card-surface p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-amber-400" />
                </div>
                <span className="text-sm font-semibold text-white">Fast Transfer</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">Available</p>
              <p className="text-xs text-[var(--arctic-muted)]">
                Iris-powered soft finality (1000 confirmations)
              </p>
            </div>

            {/* Gasless Paymaster */}
            <div className="card-surface p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-sm font-semibold text-white">Gasless Paymaster</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">50 USDC/day</p>
              <p className="text-xs text-[var(--arctic-muted)]">
                Daily limit per user
              </p>
            </div>

            {/* Security */}
            <div className="card-surface p-5 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-cyan-400" />
                </div>
                <span className="text-sm font-semibold text-white">Security</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["CCTP Burn-Mint", "ATA Validation", "Travel Rule"].map((label) => (
                  <span
                    key={label}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300"
                  >
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
