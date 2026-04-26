"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import type { WalletName } from "@solana/wallet-adapter-base";

// Whitelist of real Solana wallets — prevents EVM wallets (MetaMask etc.)
// that inject window.solana from appearing
const SOLANA_WALLET_NAMES = new Set([
  "Phantom",
  "Solflare",
  "Backpack",
  "Coinbase Wallet",
  "Trust",
  "Glow",
  "Exodus",
  "Ledger",
  "Brave Wallet",
  "Coin98",
  "MathWallet",
  "SafePal",
]);

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { wallets, select, connect, connecting, wallet } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [pendingWallet, setPendingWallet] = useState<WalletName | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Once select() updates the wallet in context → call connect()
  useEffect(() => {
    if (!pendingWallet) return;
    if (wallet?.adapter.name === pendingWallet) {
      connect().catch((err) => console.warn("[WalletModal] connect error:", err));
      setPendingWallet(null);
    }
  }, [wallet, pendingWallet, connect]);

  const handleSelect = (walletName: WalletName) => {
    const w = wallets.find((w) => w.adapter.name === walletName);
    // ── Installed: set pending then select — useEffect fires connect()
    // ── Not installed: adapter opens install page / mobile deep link
    setPendingWallet(walletName);
    select(walletName);
    if (!w || w.readyState !== WalletReadyState.Installed) {
      // Non-installed wallets redirect away — close immediately
      onClose();
    }
    // Installed wallets: modal stays open briefly showing spinner,
    // ConnectWalletButton closes it via the `connected` useEffect
  };

  // ── STRICT: only "Installed" counts as Detected ──────────────────────────
  // "Loadable" means the adapter CAN load (e.g. mobile injected) but the
  // extension is NOT installed in this browser — never show as Detected
  const solanaWallets = wallets.filter((w) => SOLANA_WALLET_NAMES.has(w.adapter.name));
  const detected  = solanaWallets.filter((w) => w.readyState === WalletReadyState.Installed);
  const available = solanaWallets.filter((w) => w.readyState !== WalletReadyState.Installed);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        // ── Full-screen overlay — rendered directly in <body> via portal
        // so NO parent stacking context can ever clip or offset it
        <motion.div
          key="wallet-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",      // ← centred vertically
            justifyContent: "center",  // ← centred horizontally
            background: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            padding: "16px",
          }}
        >
          {/* ── Modal panel ── */}
          <motion.div
            key="wallet-panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 440, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 400,
              maxHeight: "88vh",
              background: "#0c0c0c",
              border: "1px solid #1a1a1a",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px #111",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 20px 16px", borderBottom: "1px solid #111", flexShrink: 0,
            }}>
              <div>
                <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "DM Sans, sans-serif", margin: 0 }}>
                  Connect Wallet
                </p>
                <p style={{ color: "#383838", fontSize: 11, fontFamily: "DM Sans, sans-serif", margin: "3px 0 0" }}>
                  Select a Solana wallet to continue
                </p>
              </div>
              <CloseButton onClick={onClose} />
            </div>

            {/* Wallet list */}
            <div style={{ padding: "14px 14px 0", overflowY: "auto", flex: 1 }}>

              {detected.length > 0 && (
                <Section label="Detected">
                  {detected.map((w) => (
                    <WalletRow
                      key={w.adapter.name}
                      name={w.adapter.name}
                      icon={w.adapter.icon}
                      badge="detected"
                      isSpinning={connecting && pendingWallet === w.adapter.name}
                      onSelect={() => handleSelect(w.adapter.name)}
                    />
                  ))}
                </Section>
              )}

              {available.length > 0 && (
                <Section label={detected.length > 0 ? "Other Wallets" : "Available Wallets"}>
                  {available.map((w) => (
                    <WalletRow
                      key={w.adapter.name}
                      name={w.adapter.name}
                      icon={w.adapter.icon}
                      badge="none"
                      isSpinning={connecting && pendingWallet === w.adapter.name}
                      onSelect={() => handleSelect(w.adapter.name)}
                    />
                  ))}
                </Section>
              )}

              {solanaWallets.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <p style={{ color: "#333", fontSize: 12, fontFamily: "DM Sans, sans-serif" }}>
                    No Solana wallets detected
                  </p>
                  <a href="https://phantom.app" target="_blank" rel="noopener noreferrer"
                    style={{ color: "#C8F135", fontSize: 12, fontFamily: "DM Sans, sans-serif" }}>
                    Get Phantom →
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 20px 18px", borderTop: "1px solid #0f0f0f", flexShrink: 0 }}>
              <p style={{ color: "#252525", fontSize: 10, textAlign: "center", fontFamily: "DM Sans, sans-serif", margin: 0 }}>
                By connecting you agree to our{" "}
                <span style={{ color: "#2e2e2e", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#C8F135")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#2e2e2e")}>
                  Terms of Service
                </span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{
        color: "#2a2a2a", fontSize: 10, textTransform: "uppercase",
        letterSpacing: "0.12em", fontFamily: "DM Sans, sans-serif",
        marginBottom: 8, paddingLeft: 4,
      }}>
        {label}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

// ─── Close button ─────────────────────────────────────────────────────────────
function CloseButton({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 28, height: 28, borderRadius: 8, cursor: "pointer",
        border: `1px solid ${hov ? "#333" : "#1c1c1c"}`,
        background: hov ? "#111" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hov ? "#aaa" : "#404040", transition: "all 0.15s", flexShrink: 0,
      }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}

// ─── Wallet row ───────────────────────────────────────────────────────────────
interface WalletRowProps {
  name: string;
  icon: string;
  badge: "detected" | "none";
  isSpinning: boolean;
  onSelect: () => void;
}

function WalletRow({ name, icon, badge, isSpinning, onSelect }: WalletRowProps) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onSelect} disabled={isSpinning}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "10px 12px", borderRadius: 12, cursor: "pointer", textAlign: "left",
        border: `1px solid ${hov ? "rgba(200,241,53,0.18)" : "#141414"}`,
        background: hov ? "#0a1200" : "transparent",
        transform: hov ? "translateX(2px)" : "translateX(0)",
        transition: "all 0.14s ease", opacity: isSpinning ? 0.6 : 1,
      }}>
      {/* Icon */}
      <div style={{
        width: 34, height: 34, borderRadius: 9, overflow: "hidden", flexShrink: 0,
        border: "1px solid #1c1c1c", background: "#0a0a0a",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt={name} width={34} height={34}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
      </div>

      {/* Name */}
      <span style={{
        flex: 1, fontSize: 13, color: hov ? "#fff" : "#777",
        fontFamily: "DM Sans, sans-serif", transition: "color 0.14s",
      }}>
        {name}
      </span>

      {/* Spinner */}
      {isSpinning && (
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.65, repeat: Infinity, ease: "linear" }}
          style={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px solid transparent", borderTopColor: "#C8F135", flexShrink: 0 }} />
      )}

      {/* Detected badge — only when truly Installed */}
      {badge === "detected" && !isSpinning && (
        <span style={{
          fontSize: 10, padding: "2px 8px", borderRadius: 999, flexShrink: 0,
          background: "#0a1200", border: "1px solid #1e2d00", color: "#C8F135",
          fontFamily: "DM Sans, sans-serif",
        }}>
          Detected
        </span>
      )}

      {/* Arrow */}
      {!isSpinning && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <path d="M2.5 6h7M6.5 3l3 3-3 3"
            stroke={hov ? "#C8F135" : "#252525"} strokeWidth="1.3"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}