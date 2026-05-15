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
          <footer className="border-t border-white/10 py-6 mt-12">
            <div className="container mx-auto px-4 text-center">
              <p className="text-xs text-slate-500">
                Arctic Pay DApp — Built with Next.js 15 + Circle CCTP v2 + Solana
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Testnet only (Circle Sandbox + Solana Devnet + ARC Testnet)
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
