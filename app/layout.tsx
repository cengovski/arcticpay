// app/layout.tsx
// Root layout for Arctic Pay DApp
// Server component — wraps all pages with global CSS

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arctic Pay — Fast USDC Transfers",
  description:
    "Cross-chain USDC transfers with Circle CCTP v2, Fast Transfer attestation, and Onchain Travel Rule Identity. Arctic-themed Next.js DApp.",
  keywords: ["USDC", "CCTP", "bridge", "Solana", "ARC", "Circle", "DeFi"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="relative z-10 min-h-screen flex flex-col">
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[var(--arctic-border)] py-8 mt-16">
            <div className="max-w-5xl mx-auto px-5 text-center">
              <p className="text-xs text-[var(--arctic-muted)]">
                Arctic Pay — Built with Next.js 15 + Circle CCTP v2 + Solana
              </p>
              <p className="text-[10px] text-[var(--arctic-muted)]/50 mt-1">
                Testnet only (Circle Sandbox + Solana Devnet + ARC Testnet)
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
