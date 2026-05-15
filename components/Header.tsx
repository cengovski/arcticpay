// components/Header.tsx
// Arctic Pay header with wallet connection

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Snowflake } from "lucide-react";

interface HeaderProps {
  walletAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function Header({ walletAddress, onConnect, onDisconnect }: HeaderProps) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await onConnect();
    } finally {
      setConnecting(false);
    }
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Snowflake className="h-6 w-6 text-cyan-400" />
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Arctic Pay
          </span>
        </div>

        {/* Wallet */}
        {walletAddress ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300 font-mono">
              {truncateAddress(walletAddress)}
            </span>
            <Button variant="outline" size="sm" onClick={onDisconnect}>
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
  );
}
