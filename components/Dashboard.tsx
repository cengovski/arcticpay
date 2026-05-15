// components/Dashboard.tsx
// Main dashboard view with all Arctic Pay features

"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TokenSelector } from "@/components/TokenSelector";
import { TransferForm } from "@/components/TransferForm";
import { BridgePanel } from "@/components/BridgePanel";
import { TokenMetadata } from "@/lib/solanaTokenMetadata";
import { Activity, TrendingUp, Zap, Shield } from "lucide-react";

type Tab = "transfer" | "bridge" | "stats";

export function Dashboard() {
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
    <div className="space-y-6">
      {/* Token Selector */}
      <TokenSelector
        selectedMint={selectedMint}
        onSelect={(mint, meta) => {
          setSelectedMint(mint);
          setSelectedMetadata(meta);
        }}
      />

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "transfer" && (
        <TransferForm mint={selectedMint} decimals={6} />
      )}

      {activeTab === "bridge" && <BridgePanel />}

      {activeTab === "stats" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Fast Transfer Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-amber-400" />
                Fast Transfer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">Available</p>
              <p className="text-xs text-slate-400 mt-1">
                Iris-powered soft finality (1000 confirmations)
              </p>
            </CardContent>
          </Card>

          {/* Gasless Paymaster */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-emerald-400" />
                Gasless Paymaster
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">50 USDC/day</p>
              <p className="text-xs text-slate-400 mt-1">
                Daily limit per user
              </p>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-cyan-400" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <Badge variant="success">CCTP Burn-Mint</Badge>
                <Badge variant="success">ATA Validation</Badge>
                <Badge variant="success">Travel Rule</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
