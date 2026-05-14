# ARCTIC PAY - Complete Implementation Checklist (English for AI Agent)

**Instructions for AI Coding Agent (Claude / Cursor / Windsurf):**
1. Clone this branch.
2. Follow phases **in order**.
3. Use TypeScript everywhere.
4. Keep Arctic theme consistent (ice blue #00f0ff, dark navy, snow effects).
5. Test with Circle Sandbox + ARC Testnet faucet.
6. Commit often with clear messages.

## Phase 1: Core Setup ✅ (Done by you)
- [x] Next.js 15 App Router + TypeScript
- [x] Tailwind CSS + Arctic Theme (ice gradients, snow particles via CSS/Framer)
- [x] shadcn/ui + lucide-react icons
- [x] Basic layout with Arctic header/footer

## Phase 2: Fast CCTP Integration (Priority)
- [ ] `lib/cctpFastTransfer.ts` – Full Fast Transfer (Iris allowance, minFinalityThreshold: 1000, fees, re-attest fallback)
- [ ] `app/api/cctp/bridge/route.ts` – API route for bridge
- [ ] `components/FastCCTPBridgeButton.tsx` – Live allowance indicator + Arctic button
- [ ] `components/AllowanceIndicator.tsx` – Real-time Fast Allowance display

## Phase 3: Circle Identity (Travel Rule)
- [ ] `lib/circleIdentity.ts` – Build `source.identities` payload + helper
- [ ] `components/IdentityVerificationModal.tsx` – KYC form modal (GDPR safe)
- [ ] `app/api/identity/verify/route.ts` – Backend identity handler

## Phase 4: Gasless + Advanced + Deploy
- [ ] `lib/paymaster.ts` – Gasless Paymaster (50 USDC/day)
- [ ] Full dashboard page (`app/dashboard/page.tsx`)
- [ ] Cloudflare config (`next.config.js`, `wrangler.toml` if needed)
- [ ] `.env.example` complete
- [ ] Error handling, loading states, Arctic animations

## Final Steps
- [ ] Run `npm run build` → zero errors
- [ ] Test Fast Bridge + Identity flow on testnet
- [ ] Update README with live demo link after deploy

**Agent: Start with Phase 2 now. Use official Circle docs (CCTP v2, Iris sandbox: https://iris-api-sandbox.circle.com). All code must be production-ready and commented in English.**
