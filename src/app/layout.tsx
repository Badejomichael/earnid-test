import type { Metadata } from "next";
import "./globals.css";
import SolanaProvider from "@/components/SolanaProvider";

export const metadata: Metadata = {
  title: "EarnID - Verifiable Income for Africa's Digital Workforce",
  description: "Turn your freelance earnings into tamper-proof, on-chain credentials. Built on Solana.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SolanaProvider>
          {children}
        </SolanaProvider>
      </body>
    </html>
  );
}