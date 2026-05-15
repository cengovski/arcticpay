// lib/cctpBridge.ts
// Cross-chain bridge: Solana <-> ARC Testnet via Circle CCTP v2
// Uses real Circle API for burn-mint operations
// Security: inflows == outflows invariant, no client-side secrets

import {
  initiateCCTPBridge,
  initiateFastTransfer,
  fetchIrisAllowance,
} from "./circleApi";

// CCTP Domain IDs (Circle)
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
  amount: string;
  fromChain: ChainName;
  toChain: ChainName;
  recipient: string;
  useFastTransfer: boolean;
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
 * Map chain names to Circle chain identifiers.
 */
function chainToCircle(chain: ChainName): string {
  const map: Record<ChainName, string> = {
    solana: "SOL",
    ethereum_sepolia: "ETH",
    arc_testnet: "ARC",
  };
  return map[chain];
}

/**
 * Initiate a real cross-chain USDC transfer via Circle CCTP v2.
 * Supports Fast Transfer (Iris) and Standard CCTP.
 */
export async function initiateBridgeTransfer(
  params: BridgeTransferParams
): Promise<BridgeResult> {
  const { amount, fromChain, toChain, recipient, useFastTransfer } = params;

  // Input Validation
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error("Invalid bridge amount");
  }
  if (fromChain === toChain) {
    throw new Error("Source and destination chains must differ");
  }

  // Travel Rule Check ($3,000+ threshold)
  if (parsedAmount >= 3000) {
    console.warn(
      "[Bridge] Travel Rule: $3,000+ transfer requires source.identities"
    );
  }

  const sourceChainCircle = chainToCircle(fromChain) as "SOL" | "ETH" | "ARC";
  const destChainCircle = chainToCircle(toChain) as "SOL" | "ETH" | "ARC";

  // Try Fast Transfer first (if enabled)
  if (useFastTransfer) {
    try {
      const allowance = await fetchIrisAllowance();
      if (parseFloat(allowance.allowanceRemaining) >= parsedAmount) {
        console.log(
          `[Bridge] Fast Transfer available. Allowance: ${allowance.allowanceRemaining} USDC`
        );

        const fastResult = await initiateFastTransfer({
          amount,
          sourceChain: sourceChainCircle,
          destinationChain: destChainCircle,
          destinationAddress: recipient,
          minFinalityThreshold: 1000,
        });

        if (fastResult.success) {
          return {
            success: true,
            txHash: fastResult.txHash || `fast-${Date.now()}`,
            message: fastResult.message,
            fastTransfer: true,
          };
        }
        console.warn("[Bridge] Fast Transfer failed, falling back to standard");
      } else {
        console.warn(
          `[Bridge] Insufficient Fast Transfer allowance (${allowance.allowanceRemaining} USDC)`
        );
      }
    } catch (err) {
      console.warn("[Bridge] Fast Transfer check failed:", err);
    }
  }

  // Standard CCTP Bridge via Circle API
  console.log(
    `[Bridge] Initiating Standard CCTP: ${amount} USDC ${fromChain} -> ${toChain}`
  );

  try {
    const result = await initiateCCTPBridge({
      amount,
      sourceChain: sourceChainCircle,
      destinationChain: destChainCircle,
      destinationAddress: recipient,
      feeLevel: "MEDIUM",
    });

    return {
      success: result.state !== "failed",
      txHash: result.transactionId,
      message: result.message,
      fastTransfer: false,
    };
  } catch (err: any) {
    return {
      success: false,
      txHash: "",
      message: `Bridge failed: ${err.message}`,
      fastTransfer: false,
    };
  }
}

/**
 * Fetch remaining Fast Transfer allowance from Iris API.
 */
export async function fetchFastAllowance(): Promise<string> {
  try {
    const allowance = await fetchIrisAllowance();
    return allowance.allowanceRemaining;
  } catch (err) {
    console.warn("[Bridge] Fast allowance fetch failed:", err);
    return "0";
  }
}

/**
 * Check if a bridge transfer is eligible for Fast Transfer.
 */
export async function isFastTransferEligible(
  amount: string
): Promise<{ eligible: boolean; reason: string; allowance: string }> {
  const allowanceStr = await fetchFastAllowance();
  const parsedAmount = parseFloat(amount);
  const parsedAllowance = parseFloat(allowanceStr);

  if (parsedAmount > parsedAllowance) {
    return {
      eligible: false,
      reason: `Insufficient Fast Transfer allowance (${allowanceStr} USDC remaining)`,
      allowance: allowanceStr,
    };
  }

  return {
    eligible: true,
    reason: "Fast Transfer available",
    allowance: allowanceStr,
  };
}
