// components/BridgePanel.tsx
// Cross-chain bridge panel: Solana ↔ ARC Testnet via CCTP
// Clean layout with proper visual hierarchy

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { initiateBridgeTransfer, ChainName } from "@/lib/cctpBridge";
import { checkGaslessLimit, formatGaslessStatus } from "@/lib/gaslessPaymaster";
import { ArrowRightLeft, Zap, Shield, AlertTriangle, Wallet } from "lucide-react";

const CHAINS: { value: ChainName; label: string; short: string }[] = [
  { value: "solana", label: "Solana Devnet", short: "SOL" },
  { value: "arc_testnet", label: "ARC Testnet", short: "ARC" },
  { value: "ethereum_sepolia", label: "Ethereum Sepolia", short: "ETH" },
];

interface BridgePanelProps {
  walletType: "evm" | "solana" | null;
}

export function BridgePanel({ walletType }: BridgePanelProps) {
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

  useEffect(() => {
    fetch("https://iris-api-sandbox.circle.com/v2/fastBurn/USDC/allowance")
      .then((r) => r.json())
      .then((d) => setFastAllowance(d.allowance?.toString() || "0"))
      .catch(() => setFastAllowance("0"));
  }, []);

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      setFastEligible(parseFloat(amount) <= parseFloat(fastAllowance));
    }
  }, [amount, fastAllowance]);

  const handleBridge = async () => {
    if (!amount || !recipient) return;

    if (parseFloat(amount) >= 3000) {
      setShowIdentityModal(true);
      return;
    }

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
      setResult({ success: bridgeResult.success, message: bridgeResult.message });
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

  // Not connected
  if (!walletType) {
    return (
      <div className="card-surface p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
          <Wallet className="h-6 w-6 text-cyan-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-2">Wallet Required</h3>
        <p className="text-sm text-[var(--arctic-muted)] max-w-sm mx-auto">
          Connect a wallet to bridge USDC across chains.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="card-surface p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <ArrowRightLeft className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Cross-Chain Bridge</h3>
            <p className="text-xs text-[var(--arctic-muted)]">CCTP v2 burn-mint transfer</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Chain Selection */}
          <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-end">
            {/* From */}
            <div>
              <label className="text-xs font-medium text-[var(--arctic-muted)] mb-1.5 block">
                From
              </label>
              <div className="flex flex-col gap-1.5">
                {CHAINS.map((chain) => (
                  <button
                    key={chain.value}
                    onClick={() => setFromChain(chain.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-left ${
                      fromChain === chain.value
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                        : "bg-white/[0.03] text-[var(--arctic-muted)] border border-transparent hover:bg-white/[0.06]"
                    }`}
                  >
                    {chain.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Swap */}
            <button
              onClick={swapChains}
              className="p-2.5 rounded-xl bg-white/[0.04] border border-[var(--arctic-border)] hover:bg-white/[0.08] transition-colors cursor-pointer mb-1"
            >
              <ArrowRightLeft className="h-4 w-4 text-[var(--arctic-muted)]" />
            </button>

            {/* To */}
            <div>
              <label className="text-xs font-medium text-[var(--arctic-muted)] mb-1.5 block">
                To
              </label>
              <div className="flex flex-col gap-1.5">
                {CHAINS.map((chain) => (
                  <button
                    key={chain.value}
                    onClick={() => setToChain(chain.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-left ${
                      toChain === chain.value
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                        : "bg-white/[0.03] text-[var(--arctic-muted)] border border-transparent hover:bg-white/[0.06]"
                    }`}
                  >
                    {chain.label}
                  </button>
                ))}
              </div>
            </div>
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
              className="text-sm"
            />
          </div>

          {/* Recipient */}
          <div>
            <label className="text-xs font-medium text-[var(--arctic-muted)] mb-1.5 block">
              Recipient Address
            </label>
            <Input
              placeholder={`Destination address on ${CHAINS.find((c) => c.value === toChain)?.short ?? "target"}`}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setUseFastTransfer(!useFastTransfer)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                useFastTransfer && fastEligible
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "bg-white/[0.03] text-[var(--arctic-muted)] border border-[var(--arctic-border)] hover:bg-white/[0.06]"
              }`}
            >
              <Zap className="h-3 w-3" />
              Fast Transfer
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  fastEligible
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-amber-500/15 text-amber-300"
                }`}
              >
                {fastAllowance} USDC
              </span>
            </button>

            <button
              onClick={() => setUseGasless(!useGasless)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                useGasless
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "bg-white/[0.03] text-[var(--arctic-muted)] border border-[var(--arctic-border)] hover:bg-white/[0.06]"
              }`}
            >
              <Shield className="h-3 w-3" />
              Gasless
            </button>
          </div>

          {useGasless && (
            <p className="text-xs text-[var(--arctic-muted)]">{formatGaslessStatus(dailyGaslessSpent)}</p>
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
              className={`p-4 rounded-xl ${
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

          {/* Security Notice */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
            <AlertTriangle className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
            <p className="text-xs text-[var(--arctic-muted)] leading-relaxed">
              CCTP uses native burn-mint (no liquidity pools). Fast Transfer requires
              Iris attestation (minFinalityThreshold: 1000). Transfers ≥ $3,000 require
              Travel Rule identity.
            </p>
          </div>
        </div>
      </div>

      {/* Travel Rule Modal */}
      <Modal
        open={showIdentityModal}
        onClose={() => setShowIdentityModal(false)}
        title="Travel Rule Identity Required"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--arctic-text)]">
            Transfers of $3,000+ require onchain identity verification per Circle Travel Rule.
          </p>
          <p className="text-xs text-[var(--arctic-muted)]">
            In production, this would collect:
          </p>
          <ul className="text-xs text-[var(--arctic-muted)] list-disc list-inside space-y-1">
            <li>Name (individual or business)</li>
            <li>Address (street, city, country)</li>
            <li>Tax ID (optional)</li>
            <li>Date of birth (optional)</li>
          </ul>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowIdentityModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => setShowIdentityModal(false)}
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
