// lib/solanaTokenMetadata.ts
// Fetch Metaplex Token Metadata for SPL tokens on Solana
// Uses @metaplex-foundation/mpl-token-metadata for on-chain metadata
// Reference: https://developers.metaplex.com/token-metadata

import { Connection, PublicKey } from "@solana/web3.js";

// Metaplex Token Metadata Program ID (same on Devnet + Mainnet)
export const METAPLEX_METADATA_PROGRAM_ID =
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

/**
 * Token metadata information returned by the fetcher.
 */
export interface TokenMetadata {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  imageUri: string | null;
  description: string | null;
}

/**
 * Derive the Metaplex Metadata PDA for a given mint address.
 * Seeds: ["metadata", program_id, mint]
 */
export function deriveMetadataPDA(mint: PublicKey): PublicKey {
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      new PublicKey(METAPLEX_METADATA_PROGRAM_ID).toBuffer(),
      mint.toBuffer(),
    ],
    new PublicKey(METAPLEX_METADATA_PROGRAM_ID)
  );
  return metadataPDA;
}

/**
 * Parse Metaplex Token Metadata account data (V1 layout).
 * Reference: https://docs.metaplex.com/programs/token-metadata/accounts#metadata
 *
 * Layout:
 *   1 byte   - key (4 for MetadataV1)
 *   32 bytes  - update auth
 *   32 bytes  - mint
 *   32 bytes  - master edition (optional)
 *   variable  - name (4 byte len + UTF-8)
 *   variable  - symbol (4 byte len + UTF-8)
 *   variable  - uri (4 byte len + UTF-8)
 *   ... (rest skipped for our use case)
 */
function parseMetadataAccountData(data: Buffer): {
  name: string;
  symbol: string;
  uri: string;
} {
  let offset = 0;

  // Skip key (1 byte) + update_auth (32) + mint (32) = 65
  offset = 65;

  // Check for optional master edition (discriminator)
  // MetadataV1 has a boolean after mint for whether it's a collection
  // Skip it
  offset += 1; // collection flag

  // Read name
  const nameLen = data.readUInt32LE(offset);
  offset += 4;
  const name = data.slice(offset, offset + nameLen).toString("utf8").replace(/\0/g, "");
  offset += nameLen;

  // Read symbol
  const symbolLen = data.readUInt32LE(offset);
  offset += 4;
  const symbol = data.slice(offset, offset + symbolLen).toString("utf8").replace(/\0/g, "");
  offset += symbolLen;

  // Read uri
  const uriLen = data.readUInt32LE(offset);
  offset += 4;
  const uri = data.slice(offset, offset + uriLen).toString("utf8").replace(/\0/g, "");

  return { name, symbol, uri };
}

/**
 * In-memory cache for metadata (avoids redundant RPC calls).
 * TTL: 5 minutes.
 */
const metadataCache = new Map<
  string,
  { data: TokenMetadata; expires: number }
>();
const METADATA_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch on-chain Metaplex metadata + off-chain JSON for an SPL token.
 *
 * @param connection - Solana RPC connection
 * @param mint - SPL token mint address
 * @returns TokenMetadata or null if no metadata found
 */
export async function fetchTokenMetadata(
  connection: Connection,
  mint: string | PublicKey
): Promise<TokenMetadata | null> {
  const mintStr = typeof mint === "string" ? mint : mint.toBase58();

  // Check cache
  const cached = metadataCache.get(mintStr);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const mintPubkey = typeof mint === "string" ? new PublicKey(mint) : mint;

  // Derive metadata PDA
  const metadataPDA = deriveMetadataPDA(mintPubkey);

  // Fetch the metadata account
  const accountInfo = await connection.getAccountInfo(metadataPDA);
  if (!accountInfo || !accountInfo.data) {
    console.warn(`[Metadata] No metadata account for mint ${mintStr}`);
    return null;
  }

  // Parse on-chain metadata
  const { name, symbol, uri } = parseMetadataAccountData(
    Buffer.from(accountInfo.data)
  );

  // Fetch off-chain JSON for image + description
  let imageUri: string | null = null;
  let description: string | null = null;

  if (uri && uri.length > 0) {
    try {
      const cleanUri = uri.trim().replace(/\0/g, "");
      const jsonRes = await fetch(cleanUri, { signal: AbortSignal.timeout(5000) });
      if (jsonRes.ok) {
        const json = await jsonRes.json();
        imageUri = json.image || null;
        description = json.description || null;
      }
    } catch (err) {
      // URI might be IPFS or unreachable — skip gracefully
      console.warn(
        `[Metadata] Failed to fetch off-chain JSON for ${mintStr}:`,
        err
      );
    }
  }

  const result: TokenMetadata = {
    mint: mintStr,
    name: name || "Unknown Token",
    symbol: symbol || "???",
    uri,
    imageUri,
    description,
  };

  // Cache the result
  metadataCache.set(mintStr, { data: result, expires: Date.now() + METADATA_CACHE_TTL });

  return result;
}

/**
 * Fetch metadata for multiple tokens in parallel.
 * Returns a map of mint → metadata (skips tokens without metadata).
 */
export async function fetchMultipleTokenMetadata(
  connection: Connection,
  mints: string[]
): Promise<Map<string, TokenMetadata>> {
  const results = new Map<string, TokenMetadata>();

  const promises = mints.map(async (mint) => {
    try {
      const meta = await fetchTokenMetadata(connection, mint);
      if (meta) {
        results.set(mint, meta);
      }
    } catch (err) {
      console.warn(`[Metadata] Skip failed mint ${mint}:`, err);
    }
  });

  await Promise.allSettled(promises);
  return results;
}

/**
 * Clear the metadata cache (useful after transactions).
 */
export function clearMetadataCache(): void {
  metadataCache.clear();
}
