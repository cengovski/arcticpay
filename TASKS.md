# Arctic Pay DApp - AI Agent Tasks (Fully Updated English Version - May 2026)

**Security & Limitations (Critical - Read First):**
- NEVER hardcode API keys, private keys, or secrets. Use `.env.local` (gitignored) + GitHub Secrets.
- Testnet ONLY (Circle Sandbox + Solana Devnet + ARC Testnet).
- Comply with Circle Onchain Travel Rule ($3,000+ transfers require `source.identities`).
- No client-side identity storage.

## Environment Variables (`.env.example`)
```env
CIRCLE_API_KEY=your_circle_sandbox_api_key
CIRCLE_ENTITY_SECRET=your_entity_secret
NEXT_PUBLIC_CIRCLE_APP_KIT_KEY=your_app_kit_key
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your_test_wallet_base58   # backend only
NEXT_PUBLIC_SOLANA_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU  # Devnet USDC
NEXT_PUBLIC_ARC_TESTNET_CHAIN_ID=your_arc_chain_id
```

## Key Contracts & Addresses (Testnet - May 2026)
**Solana Devnet:**
- SPL Token Program ID: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
- Token-2022 Program ID: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCX2BSKgg`
- USDC Mint (Devnet): `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
- Metaplex Token Metadata Program: `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`

**ARC Testnet & CCTP (Circle):** 
- TokenMessengerV2, MessageTransmitterV2 (see Circle docs)
- Iris Sandbox: `https://iris-api-sandbox.circle.com`
- ARC CCTP Domain: 7
- Fast Transfer: minFinalityThreshold ≤ 1000

**Explored & Integrated (New):** 
- **Solana SPL Token Metadata Standards:** Use Metaplex Token Metadata Program (for SPL/Token Program) or Token-2022 Metadata Pointer + TokenMetadata Extension. Fetch via `fetchDigitalAsset` or UMI SDK. Off-chain JSON URI for name/symbol/image/description. Added to Phase 5.
- **Cross-Chain Bridge Security Protocols:** CCTP is native burn-mint (no liquidity pools, Circle attestation only). Solana: Always validate account ownership, use deterministic ATA derivation, check post-tx balance changes. Use Fast Transfer allowance + re-attest for reorg protection. Invariant: inflows == outflows. No hard-coded keys. Full security section added.

## Phase 1: Core Setup ✅ (Already Done)
- [x] Next.js 15 + TypeScript + Tailwind + shadcn/ui + Arctic theme

## Phase 2: Solana SPL Transfers + Metadata (NEW - Priority After Core)
- [ ] Implement `lib/solanaSPLTransfer.ts` (transferSPL USDC with Phantom connect)
- [ ] Add `lib/solanaTokenMetadata.ts` – Fetch Metaplex metadata (name, symbol, image URI) for SPL tokens
- [ ] Dashboard token selector with live metadata display (image + name)
- [ ] Extend bridge to Solana ↔ ARC Testnet via App Kit / CCTP
- [ ] Test: SPL transfer + metadata fetch on Solana Devnet

## Phase 3: Fast CCTP + Fast Transfer Attestation
- [ ] Full Iris integration (allowance check, minFinalityThreshold: 1000, re-attest)
- [ ] Components & API routes for Fast Bridge button + live allowance

## Phase 4: Circle Identity + Travel Rule
- [ ] `source.identities` payload + modal

## Phase 5: Gasless Paymaster, Security, UI Polish & Deploy
- [ ] Gasless (50 USDC/day limit)
- [ ] Full Arctic dashboard with snow effects
- [ ] **Security Best Practices Implemented:**
  - Account ownership validation on all Solana calls
  - Deterministic ATA checks
  - CCTP finality + allowance reorg protection
  - No client-side secrets
  - Travel Rule compliance
- [ ] Cloudflare Pages ready (`next.config.js`, deploy config)
- [ ] `npm run build` must succeed

**Agent Instructions:**
Start with **Phase 2** (Solana SPL + Metadata). All code in English with comments. Use official docs (Metaplex, Circle CCTP v2, Solana SPL). Commit after each phase. Make it beautiful, fast, and secure.

**Status:** TASKS.md fully rewritten with explorations integrated. Ready for agent!
