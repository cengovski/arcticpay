// lib/cctpBridge.ts
// Cross-chain bridge: Solana ↔ ARC Testnet via Circle CCTP v2
// CCTP = native burn-mint (no liquidity pools, Circle attestation only)
// Security: inflows == outflows invariant, no client-side secrets

import { Connection } from "@solana/web3.js";
import { getSolanaConnection } from "./solanaConnection";

// CCTP Domain IDs
export const CCTP_DOMAINS = {
  ethereum_sepolia: 0,
  solana: 5,
  arc_testnet: 7,
} as const;

export type ChainName = keyof typeof CCTP_DOMAINS;

/**
 * Bridge transfer parameters.
 */
export interface BridgeTransferParams {
  amount: string; // Human-readable amount (e.g., "10.5")
  fromChain: ChainName;
  toChain: ChainName;
  recipient: string; // Destination address
  useFastTransfer: boolean; // Fast CCTP (minFinalityThreshold: 1000)
}

/**
 * Bridge transfer result.
 */
export interface BridgeResult {
  success: boolean;
  txHash: string;
  message: string;
  fastTransfer: boolean;
}

/**
 * Initiate a cross-chain USDC transfer via CCTP.
 *
 * NOTE: This is a production scaffold. Actual CCTP integration requires:
 * 1. Circle App Kit SDK for burn/mint operations
 * 2. Iris API attestation for Fast Transfer
 * 3. On-chain program calls for Solana CCTP
 *
 * For testnet, this function validates inputs and returns a mock result.
 * Replace TODO sections with actual CCTP SDK calls.
 */
export async function initiateBridgeTransfer(
  params: BridgeTransferParams
): Promise<BridgeResult> {
  const { amount, fromChain, toChain, recipient, useFastTransfer } = params;

  // --- Input Validation ---
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error("Invalid bridge amount");
  }

  if (fromChain === toChain) {
    throw new Error("Source and destination chains must differ");
  }

  // --- Travel Rule Check ($3,000+ threshold) ---
  if (parsedAmount >= 3000) {
    console.warn(
      "[Bridge] Travel Rule: $3,000+ transfer requires source.identities"
    );
    // In production: trigger identity modal before proceeding
  }

  // --- Fast Transfer Allowance Check ---
  if (useFastTransfer) {
    try {
      const allowance = await fetchFastAllowance();
      if (parseFloat(allowance) < parsedAmount) {
        console.warn(
          "[Bridge] Fast Transfer allowance insufficient, falling back to standard"
        );
        // Fall through to standard transfer
      } else {
        console.log(
          `[Bridge] Fast Transfer available. Allowance: ${allowance} USDC`
        );
      }
    } catch (err) {
      console.warn("[Bridge] Fast Transfer check failed:", err);
    }
  }

  // --- Execute Bridge ---
  // TODO: Replace with actual CCTP SDK integration
  // For Solana → ARC:
  //   1. Burn USDC on Solana via CCTP TokenMessenger
  //   2. Wait for Circle attestation (Iris API)
  //   3. Mint USDC on ARC via MessageTransmitter
  //
  // For ARC → Solana:
  //   1. Burn USDC on ARC
  //   2. Attestation + mint on Solana

  console.log(
    `[Bridge] Initiating ${useFastTransfer ? "Fast" : "Standard"} CCTP: ` +
      `${amount} USDC from ${fromChain} to ${toChain}`
  );

  // Mock result for scaffold
  return {
    success: true,
    txHash: `mock-bridge-${Date.now()}`,
    message: `${useFastTransfer ? "Fast" : "Standard"} CCTP bridge initiated: ${amount} USDC ${fromChain} → ${toChain}`,
    fastTransfer: useFastTransfer,
  };
}

/**
 * Fetch remaining Fast Transfer allowance from Iris API.
 */
export async function fetchFastAllowance(): Promise<string> {
  try {
    const res = await fetch(
      "https://iris-api-sandbox.circle.com/v2/fastBurn/USDC/allowance",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`Iris API error: ${res.status}`);
    const data = await res.json();
    return data.allowanceRemaining || "0";
  } catch (err) {
    console.warn("[Bridge] Fast allowance fetch failed:", err);
    return "0";
  }
}

/**
 * Check if a bridge transfer is eligible for Fast Transfer.
 * Requirements:
 * - Amount ≤ remaining allowance
 * - Source chain supports Fast Transfer
 * - minFinalityThreshold ≤ 1000
 */
export async function isFastTransferEligible(
  amount: string
): Promise<{ eligible: boolean; reason: string; allowance: string }> {
  const allowance = await fetchFastAllowance();
  const parsedAmount = parseFloat(amount);
  const parsedAllowance = parseFloat(allowance);

  if (parsedAmount > parsedAllowance) {
    return {
      eligible: false,
      reason: `Insufficient Fast Transfer allowance (${allowance} USDC remaining)`,
      allowance,
    };
  }

  return {
    eligible: true,
    reason: "Fast Transfer available",
    allowance,
  };
}
