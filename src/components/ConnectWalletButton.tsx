"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

function WalletIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1 7h14" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 2l2-1 2 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="11" r="1" fill="currentColor"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const WALLETS = [
  {
    name: "Phantom",
    icon: (
      <svg width="20" height="20" viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="24" fill="#AB9FF2"/>
        <path d="M110.584 64.9142C110.584 60.9142 107.284 57.6142 103.284 57.6142H99.784C96.484 57.6142 93.784 54.9142 93.784 51.6142C93.784 40.3142 84.584 31.1142 73.284 31.1142H54.684C43.384 31.1142 34.184 40.3142 34.184 51.6142C34.184 54.9142 31.484 57.6142 28.184 57.6142H24.684C20.684 57.6142 17.384 60.9142 17.384 64.9142C17.384 68.9142 20.684 72.2142 24.684 72.2142H28.184C31.484 72.2142 34.184 74.9142 34.184 78.2142C34.184 89.5142 43.384 98.7142 54.684 98.7142H73.284C84.584 98.7142 93.784 89.5142 93.784 78.2142C93.784 74.9142 96.484 72.2142 99.784 72.2142H103.284C107.284 72.2142 110.584 68.9142 110.584 64.9142Z" fill="white"/>
        <circle cx="54" cy="65" r="7" fill="#AB9FF2"/>
        <circle cx="74" cy="65" r="7" fill="#AB9FF2"/>
      </svg>
    ),
    detected: () => typeof window !== "undefined" && !!(window as any).solana?.isPhantom,
  },
  {
    name: "Solflare",
    icon: (
      <svg width="20" height="20" viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="24" fill="#FC7227"/>
        <path d="M64 20L108 98H20L64 20Z" fill="white"/>
        <path d="M64 50L86 88H42L64 50Z" fill="#FC7227"/>
      </svg>
    ),
    detected: () => typeof window !== "undefined" && !!(window as any).solflare,
  },

];

export default function ConnectWalletButton() {
  const { connected, connecting, publicKey, disconnect, select, wallets } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);

  // Save wallet address to profile when connected
  useEffect(() => {
    if (connected && publicKey && !saved) {
      saveWalletAddress(publicKey.toString());
      setSaved(true);
    }
    if (!connected) setSaved(false);
  }, [connected, publicKey]);

  const saveWalletAddress = async (address: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ wallet_address: address }).eq("id", user.id);
  };

  const handleConnect = (walletName: string) => {
    const wallet = wallets.find((w) => w.adapter.name === walletName);
    if (wallet) {
      select(wallet.adapter.name);
      setShowModal(false);
    } else {
      // Wallet not installed — open install page
      const urls: Record<string, string> = {
        Phantom: "https://phantom.app",
        Solflare: "https://solflare.com",
        Backpack: "https://backpack.app",
      };
      if (urls[walletName]) window.open(urls[walletName], "_blank");
    }
  };

  const shortAddress = publicKey
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : "";

  if (connected && publicKey) {
    return (
      <div className="px-3 py-2.5 rounded-xl border border-[#1e2d00] flex items-center gap-2.5"
        style={{ background: "#0a1200" }}>
        <motion.div className="w-2 h-2 rounded-full bg-[#C8F135]"
          animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <span className="text-[#C8F135] text-xs tracking-wider flex-1 truncate"
          style={{ fontFamily: "'DM Mono', monospace" }}>
          {shortAddress}
        </span>
        <button onClick={() => { disconnect(); setSaved(false); }}
          className="text-[#333] hover:text-red-400 transition-colors flex-shrink-0">
          <CloseIcon />
        </button>
      </div>
    );
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowModal(true)}
        disabled={connecting}
        className="w-full px-3 py-2.5 rounded-xl border border-[#1a1a1a] flex items-center gap-2.5 hover:border-[#C8F135]/20 hover:bg-[#0a1200] transition-all group disabled:opacity-50"
      >
        <WalletIcon />
        <span className="text-[#2a2a2a] group-hover:text-[#C8F135] text-xs tracking-wider transition-colors">
          {connecting ? "Connecting..." : "Connect Wallet"}
        </span>
      </motion.button>

      {/* Wallet select modal — rendered via portal to escape sidebar overflow */}
      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
              onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.92, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-sm border border-[#1e1e1e] rounded-2xl overflow-hidden"
                style={{ background: "#0c0c0c", fontFamily: "'DM Sans', sans-serif" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#111]">
                  <div>
                    <h2 className="text-white font-bold text-base" style={{ fontFamily: "'Syne', sans-serif" }}>
                      Connect Wallet
                    </h2>
                    <p className="text-[#333] text-xs mt-0.5">Select your Solana wallet</p>
                  </div>
                  <button onClick={() => setShowModal(false)}
                    className="text-[#333] hover:text-white transition-colors p-1">
                    <CloseIcon />
                  </button>
                </div>

                {/* Wallet options */}
                <div className="p-4 space-y-2">
                  {WALLETS.map((wallet) => {
                    const isDetected = wallet.detected();
                    return (
                      <motion.button
                        key={wallet.name}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleConnect(wallet.name)}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-[#141414] hover:border-[#1e1e1e] hover:bg-[#0e0e0e] transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                          style={{ background: "#111" }}>
                          {wallet.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-white text-sm font-medium">{wallet.name}</p>
                          <p className="text-[#333] text-[10px]">
                            {isDetected ? "Detected" : "Install to connect"}
                          </p>
                        </div>
                        {isDetected ? (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#C8F135]" />
                            <span className="text-[#C8F135] text-[10px]">Ready</span>
                          </div>
                        ) : (
                          <span className="text-[#222] text-[10px] flex-shrink-0 group-hover:text-[#444] transition-colors">
                            Get →
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#0e0e0e]">
                  <p className="text-[#1e1e1e] text-[10px] text-center tracking-widest uppercase">
                    Solana Devnet · EarnID
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}