// lib/solanaConnection.ts
// Shared Solana connection singleton with retry logic

import { Connection, clusterApiUrl } from "@solana/web3.js";

let _connection: Connection | null = null;

/**
 * Get or create a shared Solana connection.
 * Uses NEXT_PUBLIC_SOLANA_RPC_URL or falls back to Devnet.
 */
export function getSolanaConnection(): Connection {
  if (!_connection) {
    const rpcUrl =
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      clusterApiUrl("devnet");
    _connection = new Connection(rpcUrl, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60_000,
    });
  }
  return _connection;
}

/**
 * Reset the connection (useful for switching networks).
 */
export function resetSolanaConnection(): void {
  _connection = null;
}
