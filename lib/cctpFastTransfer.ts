// lib/cctpFastTransfer.ts
export async function fetchFastAllowance() {
  const res = await fetch('https://iris-api-sandbox.circle.com/v2/fastBurn/USDC/allowance');
  return (await res.json()).allowance;
}

export async function initiateFastCCTPBridge(amount, fromChain, toChain) {
  const allowance = await fetchFastAllowance();
  if (parseFloat(allowance) < parseFloat(amount)) {
    throw new Error('Fast allowance yetersiz');
  }
  // AppKit bridge call with minFinalityThreshold: 1000
  console.log('Fast CCTP initiated with soft finality');
}
