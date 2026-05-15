// lib/gaslessPaymaster.ts
// Gasless paymaster for ARC Testnet transactions
// Limits: 50 USDC/day per user, enforced server-side

export interface GaslessConfig {
  dailyLimit: number; // 50 USDC
  chainId: string;
}

const DEFAULT_CONFIG: GaslessConfig = {
  dailyLimit: 50,
  chainId: process.env.NEXT_PUBLIC_ARC_TESTNET_CHAIN_ID || "arc-testnet",
};

/**
 * Check if a gasless transaction is within daily limits.
 * In production, this should be enforced server-side with a database.
 */
export function checkGaslessLimit(
  amount: string,
  dailySpent: number,
  config: GaslessConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; reason: string } {
  const parsedAmount = parseFloat(amount);
  const remaining = config.dailyLimit - dailySpent;

  if (parsedAmount <= 0) {
    return { allowed: false, remaining, reason: "Amount must be positive" };
  }

  if (parsedAmount > remaining) {
    return {
      allowed: false,
      remaining,
      reason: `Exceeds daily gasless limit (${config.dailyLimit} USDC/day). Remaining: ${remaining} USDC`,
    };
  }

  return {
    allowed: true,
    remaining: remaining - parsedAmount,
    reason: `Gasless OK. Remaining today: ${remaining - parsedAmount} USDC`,
  };
}

/**
 * Format gasless status for UI display.
 */
export function formatGaslessStatus(
  dailySpent: number,
  config: GaslessConfig = DEFAULT_CONFIG
): string {
  const remaining = Math.max(0, config.dailyLimit - dailySpent);
  return `${remaining.toFixed(2)} / ${config.dailyLimit} USDC gasless remaining today`;
}
