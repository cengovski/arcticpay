// components/TransferForm.tsx
// SPL Token transfer form with Phantom wallet integration

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { executePhantomTransfer, parseSPLAmount, isValidSolanaAddress } from "@/lib/solanaSPLTransfer";
import { getSolanaConnection } from "@/lib/solanaConnection";
import { Send, AlertCircle, CheckCircle2 } from "lucide-react";

interface TransferFormProps {
  mint: string;
  decimals?: number;
}

export function TransferForm({ mint, decimals = 6 }: TransferFormProps) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleTransfer = async () => {
    // Validate inputs
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

      const signature = await executePhantomTransfer(
        connection,
        mint,
        destination,
        rawAmount,
        decimals
      );

      setTxHash(signature);
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Transfer failed");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-cyan-400" />
          SPL Token Transfer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Destination */}
        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Destination Address
          </label>
          <Input
            placeholder="Solana address (e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="font-mono text-xs"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Amount ({decimals} decimals)
          </label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.000001"
          />
        </div>

        {/* Transfer Button */}
        <Button
          className="w-full"
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

        {/* Status Messages */}
        {status === "success" && txHash && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-emerald-300">Transfer confirmed!</p>
              <p className="text-xs text-slate-400 font-mono mt-1 break-all">
                {txHash}
              </p>
            </div>
          </div>
        )}

        {status === "error" && errorMsg && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{errorMsg}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
