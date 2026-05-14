// lib/circleIdentity.ts
// Onchain Travel Rule Identity Helper (Circle Compliance)

export interface Identity {
  type: 'INDIVIDUAL' | 'BUSINESS';
  name: string;
  address: { street: string; city: string; country: string };
  taxId?: string;
  dateOfBirth?: string;
}

export function buildIdentityPayload(userIdentity: Identity) {
  return {
    source: {
      identities: [userIdentity]
    }
  };
}

export function validateTravelRule(amount: string): boolean {
  return parseFloat(amount) >= 3000; // $3k+ threshold triggers full identity
}
