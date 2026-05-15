// app/page.tsx
// Arctic Pay main dashboard page
// Client component — contains all interactive UI

"use client";

import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { SnowEffect } from "@/components/SnowEffect";
import { Button } from "@/components/ui/button";
import { Snowflake, Zap, Shield, ArrowRightLeft, Wallet } from "lucide-react";

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Try Phantom (Solana)
      const provider = (window as any).solana;
      if (provider?.isPhantom) {
        const resp = await provider.connect();
        setWalletAddress(resp.publicKey.toString());
      } else {
        // Fallback: try window.ethereum (EVM)
        const ethProvider = (window as any).ethereum;
        if (ethProvider) {
          const accounts = await ethProvider.request({
            method: "eth_requestAccounts",
          });
          if (accounts?.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } else {
          alert("No wallet found. Please install Phantom or MetaMask.");
        }
      }
    } catch (err: any) {
      console.error("Wallet connection failed:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    const provider = (window as any).solana;
    if (provider?.disconnect) {
      provider.disconnect();
    }
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <>
      {/* Snow particles background */}
      <SnowEffect />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Snowflake className="h-6 w-6 text-cyan-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Arctic Pay
            </span>
          </div>

          {walletAddress ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300 font-mono">
                {truncateAddress(walletAddress)}
              </span>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleConnect}
              disabled={connecting}
            >
              <Wallet className="mr-2 h-4 w-4" />
              {connecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Snowflake className="h-10 w-10 text-cyan-400 animate-pulse-glow" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Arctic Pay
            </h1>
          </div>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Fast cross-chain USDC transfers with Circle CCTP v2, Iris attestation,
            and onchain Travel Rule compliance.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
              <Zap className="h-3 w-3" />
              Fast Transfer (Iris)
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              <Shield className="h-3 w-3" />
              Gasless Paymaster
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
              <ArrowRightLeft className="h-3 w-3" />
              CCTP v2 Bridge
            </span>
          </div>
        </div>

        {/* Dashboard */}
        <Dashboard />
      </div>
    </>
  );
}
