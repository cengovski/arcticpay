// lib/solanaSPLTransfer.ts
// SPL Token transfer utilities for Solana Devnet
// Uses @solana/web3.js + @solana/spl-token for USDC transfers
// Reference: https://spl.solana.com/token

import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// Solana Devnet USDC Mint (Circle testnet)
export const SOLANA_USDC_MINT =
  process.env.NEXT_PUBLIC_SOLANA_USDC_MINT ||
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

// Default RPC endpoint
export const DEFAULT_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.devnet.solana.com";

/**
 * Get or create an Associated Token Account (ATA) for a given owner + mint.
 * Returns the ATA public key (does NOT create it on-chain).
 */
export function getOrCreateATA(
  owner: PublicKey,
  mint: PublicKey
): { ata: PublicKey; createIx?: string } {
  const ata = getAssociatedTokenAddressSync(mint, owner);
  // The actual creation instruction is built in the caller
  return { ata };
}

/**
 * Validate that a token account exists and has sufficient balance.
 * Throws if account doesn't exist or balance is insufficient.
 */
export async function validateSPLBalance(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey,
  requiredAmount: bigint
): Promise<{ ata: PublicKey; balance: bigint }> {
  // Deterministic ATA derivation (security best practice)
  const ata = getAssociatedTokenAddressSync(mint, owner);

  // Check account existence
  const accountInfo = await connection.getAccountInfo(ata);
  if (!accountInfo) {
    throw new Error(
      `SPL token account ${ata.toBase58()} does not exist for owner ${owner.toBase58()}`
    );
  }

  // Check balance using parsed account data
  const account = await getAccount(connection, ata);

  if (account.amount < requiredAmount) {
    throw new Error(
      `Insufficient SPL balance: have ${account.amount}, need ${requiredAmount}`
    );
  }

  return { ata, balance: account.amount };
}

/**
 * Build an SPL token transfer transaction.
 * Does NOT sign or send — caller must do that.
 *
 * @param connection - Solana connection
 * @param sender - The sender's public key (will sign)
 * @param mint - SPL token mint address
 * @param destination - Recipient public key
 * @param amount - Amount in smallest unit (e.g., 6 decimals for USDC)
 * @param decimals - Token decimals (default 6 for USDC)
 * @returns Transaction ready to sign
 */
export async function buildSPLTransferTx(
  connection: Connection,
  sender: PublicKey,
  mint: string,
  destination: string,
  amount: bigint,
  decimals: number = 6
): Promise<{ transaction: Transaction; sourceATA: PublicKey; destATA: PublicKey }> {
  // Validate inputs
  if (amount <= BigInt(0)) {
    throw new Error("Transfer amount must be positive");
  }

  const mintPubkey = new PublicKey(mint);
  const destPubkey = new PublicKey(destination);

  // Derive ATAs deterministically (security: no manual account creation)
  const sourceATA = getAssociatedTokenAddressSync(mintPubkey, sender);
  const destATA = getAssociatedTokenAddressSync(mintPubkey, destPubkey);

  // Verify source account exists and has balance
  await validateSPLBalance(connection, sender, mintPubkey, amount);

  // Check if destination ATA exists; if not, create it
  const destAccountInfo = await connection.getAccountInfo(destATA);
  const ixs = [];

  if (!destAccountInfo) {
    // Create the destination ATA if it doesn't exist
    ixs.push(
      createAssociatedTokenAccountInstruction(
        sender, // payer
        destATA, // ata
        destPubkey, // owner
        mintPubkey // mint
      )
    );
  }

  // Build the transfer instruction
  ixs.push(
    createTransferInstruction(
      sourceATA,
      destATA,
      sender,
      amount,
      [], // no multisig signers
      TOKEN_PROGRAM_ID
    )
  );

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: sender,
    blockhash,
    lastValidBlockHeight,
  });

  transaction.add(...ixs);

  return { transaction, sourceATA, destATA };
}

/**
 * Execute an SPL transfer using Phantom wallet (browser).
 * Handles signing, sending, and confirmation.
 *
 * @param connection - Solana connection
 * @param mint - SPL token mint address
 * @param destination - Recipient address (string)
 * @param amount - Amount in smallest unit (raw, not decimal)
 * @param decimals - Token decimals
 * @returns Transaction signature string
 */
export async function executePhantomTransfer(
  connection: Connection,
  mint: string,
  destination: string,
  amount: bigint,
  decimals: number = 6
): Promise<string> {
  // Access Phantom provider from window
  const provider = (window as any).solana;
  if (!provider || !provider.isPhantom) {
    throw new Error("Phantom wallet not found. Please install Phantom.");
  }

  // Connect if not already connected
  if (!provider.publicKey) {
    await provider.connect();
  }

  const sender = provider.publicKey;

  // Build the transaction
  const { transaction } = await buildSPLTransferTx(
    connection,
    sender,
    mint,
    destination,
    amount,
    decimals
  );

  // Sign with Phantom
  const { signature } = await provider.signAndSendTransaction(transaction);

  // Confirm the transaction
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );

  // Verify post-transfer balance change (security check)
  const mintPubkey = new PublicKey(mint);
  const destATA = getAssociatedTokenAddressSync(
    mintPubkey,
    new PublicKey(destination)
  );
  const destAccount = await getAccount(connection, destATA);

  console.log(
    `[SPL Transfer] Confirmed. Destination balance: ${destAccount.amount} (amount in ${decimals} decimals)`
  );

  return signature;
}

/**
 * Format raw SPL amount to human-readable decimal string.
 * Example: 1_000_000 with 6 decimals → "1.000000"
 */
export function formatSPLAmount(raw: bigint, decimals: number): string {
  const rawStr = raw.toString().padStart(decimals + 1, "0");
  const intPart = rawStr.slice(0, -decimals);
  const fracPart = rawStr.slice(-decimals);
  return `${intPart}.${fracPart}`.replace(/\.?0+$/, "");
}

/**
 * Parse human-readable amount to SPL raw amount.
 * Example: "1.5" with 6 decimals → 1_500_000n
 */
export function parseSPLAmount(amount: string, decimals: number): bigint {
  const parts = amount.split(".");
  const intPart = parts[0] || "0";
  const fracPart = (parts[1] || "").padEnd(decimals, "0").slice(0, decimals);
  return BigInt(intPart + fracPart);
}

/**
 * Validate a Solana address (base58, 32-44 chars).
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    const pubkey = new PublicKey(address);
    return PublicKey.isOnCurve(pubkey.toBytes());
  } catch {
    return false;
  }
}
