// components/BridgePanel.tsx
// Cross-chain bridge panel: Solana ↔ ARC Testnet via CCTP
// Supports Fast Transfer (Iris) and Standard CCTP

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  initiateBridgeTransfer,
  isFastTransferEligible,
  fetchFastAllowance,
  ChainName,
} from "@/lib/cctpBridge";
import { checkGaslessLimit, formatGaslessStatus } from "@/lib/gaslessPaymaster";
import { ArrowRightLeft, Zap, Shield, AlertTriangle } from "lucide-react";

const CHAINS: { value: ChainName; label: string }[] = [
  { value: "solana", label: "Solana Devnet" },
  { value: "arc_testnet", label: "ARC Testnet" },
  { value: "ethereum_sepolia", label: "Ethereum Sepolia" },
];

export function BridgePanel() {
  const [amount, setAmount] = useState("");
  const [fromChain, setFromChain] = useState<ChainName>("solana");
  const [toChain, setToChain] = useState<ChainName>("arc_testnet");
  const [recipient, setRecipient] = useState("");
  const [useFastTransfer, setUseFastTransfer] = useState(true);
  const [useGasless, setUseGasless] = useState(false);
  const [bridging, setBridging] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [fastAllowance, setFastAllowance] = useState<string>("0");
  const [fastEligible, setFastEligible] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [dailyGaslessSpent, setDailyGaslessSpent] = useState(0);

  // Fetch Fast Transfer allowance on mount
  useEffect(() => {
    fetchFastAllowance().then(setFastAllowance);
  }, []);

  // Check fast transfer eligibility when amount changes
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      isFastTransferEligible(amount).then(({ eligible, allowance }) => {
        setFastEligible(eligible);
        setFastAllowance(allowance);
      });
    }
  }, [amount]);

  const handleBridge = async () => {
    if (!amount || !recipient) return;

    // Travel Rule check
    if (parseFloat(amount) >= 3000) {
      setShowIdentityModal(true);
      return;
    }

    // Gasless limit check
    if (useGasless) {
      const gaslessCheck = checkGaslessLimit(amount, dailyGaslessSpent);
      if (!gaslessCheck.allowed) {
        setResult({ success: false, message: gaslessCheck.reason });
        return;
      }
    }

    setBridging(true);
    setResult(null);

    try {
      const bridgeResult = await initiateBridgeTransfer({
        amount,
        fromChain,
        toChain,
        recipient,
        useFastTransfer: useFastTransfer && fastEligible,
      });

      setResult({
        success: bridgeResult.success,
        message: bridgeResult.message,
      });

      if (useGasless) {
        setDailyGaslessSpent((prev) => prev + parseFloat(amount));
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || "Bridge failed" });
    } finally {
      setBridging(false);
    }
  };

  const swapChains = () => {
    setFromChain(toChain);
    setToChain(fromChain);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-cyan-400" />
            Cross-Chain Bridge (CCTP v2)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* From Chain */}
          <div>
            <label className="text-sm text-slate-400 mb-1 block">From</label>
            <div className="flex gap-2">
              {CHAINS.map((chain) => (
                <button
                  key={chain.value}
                  onClick={() => setFromChain(chain.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    fromChain === chain.value
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {chain.label}
                </button>
              ))}
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center">
            <button
              onClick={swapChains}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {/* To Chain */}
          <div>
            <label className="text-sm text-slate-400 mb-1 block">To</label>
            <div className="flex gap-2">
              {CHAINS.map((chain) => (
                <button
                  key={chain.value}
                  onClick={() => setToChain(chain.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    toChain === chain.value
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {chain.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Amount (USDC)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
            />
          </div>

          {/* Recipient */}
          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Recipient Address ({toChain})
            </label>
            <Input
              placeholder="Destination address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-3">
            {/* Fast Transfer toggle */}
            <button
              onClick={() => setUseFastTransfer(!useFastTransfer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                useFastTransfer && fastEligible
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-white/5 text-slate-500 border border-white/10"
              }`}
            >
              <Zap className="h-3 w-3" />
              Fast Transfer
              <Badge variant={fastEligible ? "success" : "warning"} className="ml-1">
                {fastAllowance} USDC
              </Badge>
            </button>

            {/* Gasless toggle */}
            <button
              onClick={() => setUseGasless(!useGasless)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                useGasless
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-white/5 text-slate-500 border border-white/10"
              }`}
            >
              <Shield className="h-3 w-3" />
              Gasless
            </button>
          </div>

          {/* Gasless status */}
          {useGasless && (
            <p className="text-xs text-slate-400">
              {formatGaslessStatus(dailyGaslessSpent)}
            </p>
          )}

          {/* Bridge Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleBridge}
            disabled={bridging || !amount || !recipient}
          >
            {bridging ? (
              <>
                <div className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Bridging...
              </>
            ) : (
              <>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Bridge USDC
              </>
            )}
          </Button>

          {/* Result */}
          {result && (
            <div
              className={`p-3 rounded-lg ${
                result.success
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              <p className={`text-sm ${result.success ? "text-emerald-300" : "text-red-300"}`}>
                {result.message}
              </p>
            </div>
          )}

          {/* Security notice */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
            <AlertTriangle className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-400">
              CCTP uses native burn-mint (no liquidity pools). Fast Transfer requires
              Iris attestation (minFinalityThreshold: 1000). Transfers ≥ $3,000 require
              Travel Rule identity.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Travel Rule Identity Modal */}
      <Modal
        open={showIdentityModal}
        onClose={() => setShowIdentityModal(false)}
        title="Travel Rule Identity Required"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Transfers of $3,000+ require onchain identity verification per Circle Travel Rule.
          </p>
          <p className="text-xs text-slate-400">
            In production, this would open a form to collect:
          </p>
          <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
            <li>Name (individual or business)</li>
            <li>Address (street, city, country)</li>
            <li>Tax ID (optional)</li>
            <li>Date of birth (optional)</li>
          </ul>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowIdentityModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowIdentityModal(false);
                // In production: proceed with identity payload
              }}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
