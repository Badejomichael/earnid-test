"use client";

import { ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  
  CoinbaseWalletAdapter,
  TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets";

const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet"
  ? "mainnet-beta"
  : "devnet";

const ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl(NETWORK as "mainnet-beta" | "devnet");

export default function SolanaProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}