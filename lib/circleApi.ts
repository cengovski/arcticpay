// lib/circleApi.ts
// Circle API client for CCTP v2, Iris Fast Transfer, and Entity management
// Docs: https://developers.circle.com/api-reference

const CIRCLE_BASE_URL = "https://api-sandbox.circle.com";
const IRIS_BASE_URL = "https://iris-api-sandbox.circle.com";

/**
 * Circle API authentication header.
 * Uses Bearer token from CIRCLE_API_KEY.
 */
function getAuthHeaders(): Record<string, string> {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    throw new Error("CIRCLE_API_KEY not configured in environment");
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

// Entity & Wallet Management

export interface CircleEntity {
  id: string;
  type: "endUserWallet" | "merchantWallet";
  state: "active" | "suspended";
  createDate: string;
}

/**
 * Get entity information from Circle.
 */
export async function getEntity(): Promise<CircleEntity> {
  const res = await fetch(`${CIRCLE_BASE_URL}/v1/w3s/entity`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Circle entity error: ${res.status}`);
  const data = await res.json();
  return data.data;
}

/**
 * Create a developer-controlled wallet on Circle.
 */
export interface CreateWalletParams {
  walletSetId: string;
  blockchains: string[];
  accountType: "SCA" | "EOA";
  count?: number;
}

export async function createWallet(params: CreateWalletParams) {
  const res = await fetch(`${CIRCLE_BASE_URL}/v1/w3s/developer/wallets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      walletSetId: params.walletSetId,
      blockchains: params.blockchains,
      accountType: params.accountType,
      count: params.count || 1,
    }),
  });
  if (!res.ok) throw new Error(`Circle wallet creation error: ${res.status}`);
  return (await res.json()).data;
}

// CCTP v2 Bridge

export interface CCTPBridgeRequest {
  amount: string;
  sourceChain: "SOL" | "ETH" | "ARC";
  destinationChain: "SOL" | "ETH" | "ARC";
  destinationAddress: string;
  feeLevel?: "LOW" | "MEDIUM" | "HIGH";
}

export interface CCTPBridgeResult {
  transactionId: string;
  state: "pending" | "complete" | "failed";
  txHash?: string;
  message: string;
}

/**
 * Initiate a CCTP v2 cross-chain USDC transfer.
 * Uses Circle developer-controlled wallets for burn-mint.
 */
export async function initiateCCTPBridge(
  params: CCTPBridgeRequest
): Promise<CCTPBridgeResult> {
  const res = await fetch(
    `${CIRCLE_BASE_URL}/v1/w3s/developer/transactions/transfer`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        walletId: params.sourceChain,
        destinationAddress: params.destinationAddress,
        tokenId: getTokenIdForChain(params.sourceChain),
        amount: [params.amount],
        feeLevel: params.feeLevel || "MEDIUM",
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`CCTP bridge error: ${res.status} - ${errText}`);
  }

  const data = await res.json();
  return {
    transactionId: data.data.id,
    state: data.data.state || "pending",
    txHash: data.data.txHash,
    message: `CCTP bridge initiated: ${params.amount} USDC ${params.sourceChain} -> ${params.destinationChain}`,
  };
}

/**
 * Get the Circle token ID for a given chain.
 */
function getTokenIdForChain(chain: string): string {
  const tokenIds: Record<string, string> = {
    SOL: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    ETH: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    ARC: "0x3600000000000000000000000000000000000000",
  };
  return tokenIds[chain] || tokenIds.SOL;
}

/**
 * Get transaction status from Circle.
 */
export async function getTransactionStatus(transactionId: string) {
  const res = await fetch(
    `${CIRCLE_BASE_URL}/v1/w3s/transactions/${transactionId}`,
    { headers: getAuthHeaders(), cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Transaction status error: ${res.status}`);
  return (await res.json()).data;
}

// Iris Fast Transfer

export interface FastTransferAllowance {
  allowanceRemaining: string;
  totalAllowance: string;
  expiresAt?: string;
}

/**
 * Fetch Fast Transfer allowance from Iris API.
 * Fast Transfer enables near-instant CCTP with minFinalityThreshold: 1000.
 */
export async function fetchIrisAllowance(): Promise<FastTransferAllowance> {
  const res = await fetch(
    `${IRIS_BASE_URL}/v2/fastBurn/USDC/allowance`,
    { headers: getAuthHeaders(), cache: "no-store" }
  );
  if (!res.ok) {
    console.warn(`[Iris] Allowance fetch failed: ${res.status}`);
    return { allowanceRemaining: "0", totalAllowance: "0" };
  }
  const data = await res.json();
  return {
    allowanceRemaining: data.allowanceRemaining || "0",
    totalAllowance: data.totalAllowance || "0",
    expiresAt: data.expiresAt,
  };
}

/**
 * Initiate a Fast Transfer via Iris.
 * Requires sufficient allowance and minFinalityThreshold <= 1000.
 */
export interface FastTransferRequest {
  amount: string;
  sourceChain: string;
  destinationChain: string;
  destinationAddress: string;
  minFinalityThreshold?: number;
}

export async function initiateFastTransfer(
  params: FastTransferRequest
): Promise<{ success: boolean; txHash?: string; message: string }> {
  const allowance = await fetchIrisAllowance();
  if (parseFloat(allowance.allowanceRemaining) < parseFloat(params.amount)) {
    return {
      success: false,
      message: `Insufficient Fast Transfer allowance (${allowance.allowanceRemaining} USDC remaining)`,
    };
  }

  const res = await fetch(`${IRIS_BASE_URL}/v2/fastBurn/USDC`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      amount: params.amount,
      sourceChain: params.sourceChain,
      destinationChain: params.destinationChain,
      destinationAddress: params.destinationAddress,
      minFinalityThreshold: params.minFinalityThreshold || 1000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return {
      success: false,
      message: `Fast Transfer failed: ${res.status} - ${errText}`,
    };
  }

  const data = await res.json();
  return {
    success: true,
    txHash: data.txHash,
    message: `Fast Transfer initiated: ${params.amount} USDC ${params.sourceChain} -> ${params.destinationChain}`,
  };
}

// Travel Rule Identity

export interface TravelRulePayload {
  source: {
    identities: Array<{
      type: "INDIVIDUAL" | "BUSINESS";
      name: string;
      address: {
        street: string;
        city: string;
        country: string;
      };
      taxId?: string;
      dateOfBirth?: string;
    }>;
  };
}

/**
 * Submit Travel Rule identity to Circle for compliance.
 * Required for transfers >= $3,000.
 */
export async function submitTravelRuleIdentity(
  payload: TravelRulePayload
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${CIRCLE_BASE_URL}/v1/w3s/compliance/travelRule`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    return {
      success: false,
      message: `Travel Rule submission failed: ${res.status} - ${errText}`,
    };
  }

  return { success: true, message: "Travel Rule identity submitted" };
}
