"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import WalletModal from "./WalletModal";
import WalletSuccessToast from "./WalletSuccessToast";

async function loadSavedWallet(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles").select("wallet_address").eq("id", user.id).single();
  return data?.wallet_address ?? null;
}

async function saveWalletToDB(addr: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").update({ wallet_address: addr }).eq("id", user.id);
}

async function clearWalletFromDB() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").update({ wallet_address: null }).eq("id", user.id);
}

// Icon 
function WalletIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 7h14" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
      <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Component 
export default function ConnectWalletButton() {
  const { publicKey, connected, disconnect, connecting } = useWallet();

  const [modalOpen, setModalOpen]     = useState(false);
  const [savedAddress, setSavedAddress] = useState<string | null>(null);
  const [showToast, setShowToast]     = useState(false);
  const [mounted, setMounted]         = useState(false);
  const userInitiated = useRef(false);

  // On mount: load DB address
  useEffect(() => {
    setMounted(true);
    loadSavedWallet().then((addr) => { if (addr) setSavedAddress(addr); });
  }, []);

  // When wallet connects: save to DB
  useEffect(() => {
    if (connected && publicKey) {
      const addr = publicKey.toBase58();
      setSavedAddress(addr);
      saveWalletToDB(addr);
      setModalOpen(false); 

      if (userInitiated.current) {
        setShowToast(true);
        userInitiated.current = false;
        const t = setTimeout(() => setShowToast(false), 4500);
        return () => clearTimeout(t);
      }
    }
  }, [connected, publicKey]);

  const openModal = useCallback(() => {
    userInitiated.current = true;
    setModalOpen(true);
  }, []);

  const handleDisconnect = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await disconnect();
    setSavedAddress(null);
    await clearWalletFromDB();
  }, [disconnect]);

  // SSR skeleton 
  if (!mounted) {
    return (
      <div style={{
        padding: "10px 12px", borderRadius: 12, border: "1px solid #111",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a1a1a" }} />
        <span style={{ color: "#1e1e1e", fontSize: 12, fontFamily: "DM Sans, sans-serif" }}>
          Connect Wallet
        </span>
      </div>
    );
  }

  const liveAddr    = connected && publicKey ? publicKey.toBase58() : null;
  const displayAddr = liveAddr ?? savedAddress;
  const shortAddr   = displayAddr
    ? `${displayAddr.slice(0, 4)}...${displayAddr.slice(-4)}`
    : null;

  // Connected
  if (shortAddr) {
    return (
      <>
        <ConnectedPill
          shortAddr={shortAddr}
          fullAddr={displayAddr ?? ""}
          onDisconnect={handleDisconnect}
        />
        <WalletSuccessToast
          show={showToast}
          address={displayAddr ?? ""}
          onClose={() => setShowToast(false)}
        />
      </>
    );
  }

  // Connecting
  if (connecting) {
    return (
      <div style={{
        padding: "10px 12px", borderRadius: 12, border: "1px solid #1a1a1a",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <motion.div
          style={{ width: 8, height: 8, borderRadius: "50%", background: "#C8F135" }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span style={{ color: "#444", fontSize: 12, fontFamily: "DM Sans, sans-serif" }}>
          Connecting…
        </span>
      </div>
    );
  }

  // Disconnected 
  return (
    <>
      <DisconnectedButton onClick={openModal} />
      <WalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <WalletSuccessToast
        show={showToast}
        address={displayAddr ?? ""}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}

// Sub-components 
function ConnectedPill({
  shortAddr, fullAddr, onDisconnect,
}: {
  shortAddr: string;
  fullAddr: string;
  onDisconnect: (e: React.MouseEvent) => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "10px 12px", borderRadius: 12,
        border: `1px solid ${hov ? "#2a3d00" : "#1e2d00"}`,
        background: "#0a1200", display: "flex", alignItems: "center", gap: 10,
        transition: "border-color 0.15s",
      }}
    >
      <motion.div
        style={{ width: 8, height: 8, borderRadius: "50%", background: "#C8F135", flexShrink: 0 }}
        animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
      />
      <span
        title={fullAddr}
        style={{
          color: "#C8F135", fontSize: 12, flex: 1, overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap",
          fontFamily: "'DM Mono', monospace",
        }}
      >
        {shortAddr}
      </span>
      <button
        onClick={onDisconnect}
        title="Disconnect wallet"
        style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          color: hov ? "#f87171" : "#333", transition: "color 0.15s", flexShrink: 0,
          opacity: hov ? 1 : 0,
        }}
      >
        <CloseIcon />
      </button>
    </motion.div>
  );
}

function DisconnectedButton({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", padding: "10px 12px", borderRadius: 12, cursor: "pointer",
        border: `1px solid ${hov ? "rgba(200,241,53,0.2)" : "#1a1a1a"}`,
        background: hov ? "#0a1200" : "transparent",
        display: "flex", alignItems: "center", gap: 10,
        transition: "all 0.15s",
      }}
    >
      <span style={{ color: hov ? "#C8F135" : "#2a2a2a", transition: "color 0.15s", flexShrink: 0 }}>
        <WalletIcon />
      </span>
      <span style={{
        color: hov ? "#C8F135" : "#2a2a2a", fontSize: 12, transition: "color 0.15s",
        fontFamily: "DM Sans, sans-serif", letterSpacing: "0.04em",
      }}>
        Connect Wallet
      </span>
    </button>
  );
}