"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Credential {
  id: string;
  total_earned: number;
  consistency_score: number;
  active_since: string;
  monthly_average: number;
  top_sources: string[];
  mint_address: string | null;
  tx_hash: string | null;
  is_public: boolean;
  created_at: string;
  user_id: string;
}

interface Profile {
  full_name: string;
  profession: string;
}

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#111" strokeWidth="10" />
        <motion.circle
          cx={cx} cy={cx} r={r} fill="none" stroke="#C8F135" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 2, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-black leading-none"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: size * 0.22 }}>
          {score}
        </span>
        <span className="text-[#444] tracking-widest uppercase" style={{ fontSize: size * 0.07 }}>score</span>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isPrint = searchParams.get("print") === "true";
  const credentialId = params.id as string;
  const supabase = createClient();

  const [credential, setCredential] = useState<Credential | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    loadCredential();
  }, [credentialId]);

  // Auto-print when opened with ?print=true
  useEffect(() => {
    if (isPrint && !loading && (credential || credentialId === "demo")) {
      const timer = setTimeout(() => {
        window.print();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isPrint, loading, credential]);

  const loadCredential = async () => {
    if (!credentialId || credentialId === "demo") {
      setNotFound(false);
      setLoading(false);
      return;
    }

    const { data: credData, error } = await supabase
      .from("credentials")
      .select("*")
      .eq("id", credentialId)
      .eq("is_public", true)
      .single();

    if (error || !credData) { setNotFound(true); setLoading(false); return; }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, profession")
      .eq("id", credData.user_id)
      .single();

    setCredential(credData);
    setProfile(profileData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#111] border-t-[#C8F135] rounded-full" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center text-white"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <p className="text-[#C8F135] text-4xl mb-4">◈</p>
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Credential not found</h1>
        <p className="text-[#444] text-sm mb-6">This credential may have been removed or made private.</p>
        <Link href="/">
          <button className="px-6 py-3 rounded-full bg-[#C8F135] text-black text-sm font-semibold">
            Go to EarnID →
          </button>
        </Link>
      </div>
    );
  }

  const cred = credential ?? {
    id: "demo",
    total_earned: 24800,
    consistency_score: 87,
    active_since: "2022-01-01",
    monthly_average: 2066,
    top_sources: ["Upwork", "Toptal", "Direct"],
    mint_address: "7xKpDemo3nRqABCDEF",
    tx_hash: null,
    is_public: true,
    created_at: new Date().toISOString(),
    user_id: "",
  };

  const prof = profile ?? { full_name: "Adaeze Okonkwo", profession: "UI/UX Designer" };
  const mintAddr = cred.mint_address
    ? `${cred.mint_address.slice(0, 8)}...${cred.mint_address.slice(-6)}`
    : "Solana Devnet";
  const minted = new Date(cred.created_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${cred.id}`
    : `/verify/${cred.id}`;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .print-center { display: flex !important; align-items: center !important; justify-content: center !important; min-height: 100vh !important; }
        }
      `}</style>

      <div
        className="min-h-screen bg-[#080808] flex flex-col print-center"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Top nav — hidden on print */}
        {!isPrint && (
          <nav className="no-print fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 border-b border-[#111]"
            style={{ background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)" }}>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#C8F135] flex items-center justify-center">
                <span className="text-black text-xs font-black">E</span>
              </div>
              <span className="text-white font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>EarnID</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#C8F135] animate-pulse" />
              <span className="text-[#C8F135] text-xs tracking-widest uppercase">Verified on Solana</span>
            </div>
            <Link href="/register">
              <button className="px-4 py-2 rounded-full bg-[#C8F135] text-black text-xs font-semibold">
                Get EarnID →
              </button>
            </Link>
          </nav>
        )}

        {/* Main credential card */}
        <div className={`flex items-center justify-center flex-1 px-4 ${!isPrint ? "pt-24 pb-12" : "py-0"}`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-xl"
          >
            {/* Card */}
            <div
              className="relative rounded-2xl p-8 border border-[#1f1f1f] overflow-hidden"
              style={{ background: "linear-gradient(160deg, #111 0%, #0a0a0a 100%)" }}
            >
              {/* Glow TR */}
              <div className="absolute top-0 right-0 w-48 h-48 opacity-10 pointer-events-none"
                style={{ background: "radial-gradient(circle at top right, #C8F135, transparent 70%)" }} />
              {/* Glow BL */}
              <div className="absolute bottom-0 left-0 w-36 h-36 opacity-5 pointer-events-none"
                style={{ background: "radial-gradient(circle at bottom left, #C8F135, transparent 70%)" }} />

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#C8F135] flex items-center justify-center">
                    <span className="text-black text-xs font-black">E</span>
                  </div>
                  <span className="text-xs tracking-[0.2em] text-[#444] uppercase"
                    style={{ fontFamily: "'DM Mono', monospace" }}>EarnID</span>
                </div>
                <span className="text-[9px] tracking-[0.3em] text-[#C8F135] border border-[#C8F135]/20 px-3 py-1.5 rounded-full"
                  style={{ fontFamily: "'DM Mono', monospace" }}>
                  VERIFIED
                </span>
              </div>

              {/* Name */}
              <div className="mb-6">
                <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase mb-1">Income Credential</p>
                <h1 className="text-white text-3xl font-extrabold mb-1"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                  {prof.full_name}
                </h1>
                <p className="text-[#555] text-sm">{prof.profession} · Nigeria</p>
              </div>

              {/* Score + Stats */}
              <div className="flex items-center gap-6 mb-6">
                <ScoreRing score={cred.consistency_score} size={120} />
                <div className="space-y-3 flex-1">
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase">Total Verified</p>
                    <p className="text-white font-bold text-2xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                      ${cred.total_earned.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase">Avg / Month</p>
                    <p className="text-[#888] text-base">${Math.round(cred.monthly_average).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase">Active Since</p>
                    <p className="text-[#888] text-base">
                      {new Date(cred.active_since).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sources */}
              <div className="flex gap-2 flex-wrap mb-6">
                {cred.top_sources.map((s) => (
                  <span key={s}
                    className="text-[9px] tracking-wider px-3 py-1 rounded-full border border-[#202020] text-[#555]"
                    style={{ fontFamily: "'DM Mono', monospace" }}>
                    {s}
                  </span>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-[#161616] pt-5 mb-5" />

              {/* On-chain proof */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[8px] tracking-widest text-[#222] uppercase mb-1">On-chain proof</p>
                  <p className="text-[10px] text-[#3a3a3a] mb-0.5"
                    style={{ fontFamily: "'DM Mono', monospace" }}>
                    SOL · {mintAddr}
                  </p>
                  <p className="text-[9px] text-[#2a2a2a]"
                    style={{ fontFamily: "'DM Mono', monospace" }}>
                    {verifyUrl}
                  </p>
                </div>
                {/* QR */}
                <div className="w-12 h-12 bg-white rounded-md p-1.5 opacity-90">
                  <svg viewBox="0 0 10 10" className="w-full h-full">
                    {[[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[4,0],[4,1],[4,2],[5,1],[7,0],[8,0],[9,0],[7,1],[9,1],[7,2],[8,2],[9,2],[0,4],[1,4],[3,4],[5,4],[6,4],[8,4],[9,4],[0,5],[2,5],[4,5],[6,5],[8,5],[0,6],[2,6],[3,6],[5,6],[7,6],[9,6],[0,7],[1,7],[2,7],[4,7],[6,7],[8,7],[9,7],[0,8],[3,8],[5,8],[7,8],[0,9],[1,9],[2,9],[4,9],[5,9],[7,9],[9,9]].map(([cx, cy], i) => (
                      <rect key={i} x={cx} y={cy} width="1" height="1" fill="black" />
                    ))}
                  </svg>
                </div>
              </div>

              {/* Bottom strip */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#111]">
                <div>
                  <p className="text-[8px] tracking-widest text-[#1e1e1e] uppercase mb-0.5">Minted on</p>
                  <p className="text-[10px] text-[#2a2a2a]" style={{ fontFamily: "'DM Mono', monospace" }}>{minted}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] tracking-widest text-[#1e1e1e] uppercase mb-0.5">Network</p>
                  <p className="text-[10px] text-[#2a2a2a]" style={{ fontFamily: "'DM Mono', monospace" }}>Solana Devnet</p>
                </div>
              </div>
            </div>

            {/* Verify strip — hidden on print */}
            {!isPrint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="no-print mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#111]"
                style={{ background: "#0a0a0a" }}
              >
                <div className="w-2 h-2 rounded-full bg-[#C8F135]" />
                <p className="text-[#444] text-xs tracking-widest uppercase">
                  This credential is verified on the Solana blockchain
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Footer — hidden on print */}
        {!isPrint && (
          <footer className="no-print border-t border-[#0d0d0d] px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#C8F135] flex items-center justify-center">
                <span className="text-black text-[9px] font-black">E</span>
              </div>
              <span className="text-[#222] text-xs font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>EarnID</span>
            </div>
            <p className="text-[#1a1a1a] text-[10px] tracking-widest uppercase">
              Built on Solana · Superteam Nigeria · Frontier 2025
            </p>
            <Link href="/register">
              <span className="text-[#333] text-xs hover:text-[#C8F135] transition-colors cursor-pointer">
                Get your EarnID →
              </span>
            </Link>
          </footer>
        )}
      </div>
    </>
  );
}