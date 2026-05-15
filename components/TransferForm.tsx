// components/TransferForm.tsx
// SPL Token transfer form with Phantom wallet integration
// Clean layout with proper spacing and visual hierarchy

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { executePhantomTransfer, parseSPLAmount, isValidSolanaAddress } from "@/lib/solanaSPLTransfer";
import { getSolanaConnection } from "@/lib/solanaConnection";
import { Send, AlertCircle, CheckCircle2, Wallet } from "lucide-react";

interface TransferFormProps {
  mint: string;
  decimals?: number;
  walletType: "evm" | "solana" | null;
}

export function TransferForm({ mint, decimals = 6, walletType }: TransferFormProps) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleTransfer = async () => {
    if (!destination || !amount) {
      setStatus("error");
      setErrorMsg("Please fill in all fields");
      return;
    }

    if (!isValidSolanaAddress(destination)) {
      setStatus("error");
      setErrorMsg("Invalid Solana address");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setStatus("error");
      setErrorMsg("Invalid amount");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const connection = getSolanaConnection();
      const rawAmount = parseSPLAmount(amount, decimals);
      const signature = await executePhantomTransfer(connection, mint, destination, rawAmount, decimals);
      setTxHash(signature);
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Transfer failed");
    }
  };

  // Not connected to Solana wallet
  if (walletType !== "solana") {
    return (
      <div className="card-surface p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
          <Wallet className="h-6 w-6 text-purple-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-2">Solana Wallet Required</h3>
        <p className="text-sm text-[var(--arctic-muted)] max-w-sm mx-auto">
          Connect a Solana wallet (Phantom, Solflare, or Backpack) to send SPL token transfers.
        </p>
      </div>
    );
  }

  return (
    <div className="card-surface p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
          <Send className="h-4 w-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">SPL Token Transfer</h3>
          <p className="text-xs text-[var(--arctic-muted)]">Send USDC on Solana Devnet</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Destination */}
        <div>
          <label className="text-xs font-medium text-[var(--arctic-muted)] mb-1.5 block">
            Destination Address
          </label>
          <Input
            placeholder="Solana address (e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="font-mono text-sm"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-medium text-[var(--arctic-muted)] mb-1.5 block">
            Amount (USDC)
          </label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.000001"
            className="text-sm"
          />
        </div>

        {/* Button */}
        <Button
          className="w-full mt-2"
          onClick={handleTransfer}
          disabled={status === "sending"}
        >
          {status === "sending" ? (
            <>
              <div className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Transfer
            </>
          )}
        </Button>
      </div>

      {/* Status Messages */}
      {status === "success" && txHash && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-300">Transfer confirmed!</p>
              <p className="text-xs text-[var(--arctic-muted)] font-mono mt-1.5 break-all">
                {txHash}
              </p>
            </div>
          </div>
        </div>
      )}

      {status === "error" && errorMsg && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{errorMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
