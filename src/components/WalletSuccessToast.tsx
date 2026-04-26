"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface WalletSuccessToastProps {
  show: boolean;
  address: string;
  onClose: () => void;
}

export default function WalletSuccessToast({ show, address, onClose }: WalletSuccessToastProps) {
  const short = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "";
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  // Render in a portal so it's always above everything and truly centered
  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center"
          style={{
            zIndex: 99997,
            gap: 10,
            padding: "10px 16px 10px 12px",
            borderRadius: 999,
            border: "1px solid #1e2d00",
            background: "#0a1200",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px #1e2d00",
            fontFamily: "DM Sans, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {/* Animated check circle */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.05, type: "spring", stiffness: 500, damping: 22 }}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: "1px solid #2a3d00",
                background: "#111f00",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
                <motion.path
                  d="M2 6.5l3.2 3.2 5.8-5.8"
                  stroke="#C8F135"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
                />
              </svg>
            </motion.div>
            {/* Pulse ring */}
            <motion.div
              style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: "1px solid rgba(200,241,53,0.3)",
              }}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            />
          </div>

          {/* Text */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 500 }}>
              Wallet connected
            </span>
            <span style={{
              color: "#C8F135", fontSize: 11,
              fontFamily: "'DM Mono', monospace",
            }}>
              {short}
            </span>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#333", padding: 0, marginLeft: 4, flexShrink: 0,
              display: "flex", alignItems: "center",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <line x1="1" y1="1" x2="8" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="8" y1="1" x2="1" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}