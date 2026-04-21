"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import QRCodeDisplay from "@/components/QRCodeDisplay";

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

function FloatingOrb({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y, width: size, height: size,
        background: "radial-gradient(circle, rgba(200,241,53,0.07) 0%, transparent 70%)",
        filter: "blur(60px)",
      }}
      animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 7 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

function ScoreRing({ score, size = 130 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#111" strokeWidth="9" />
        <motion.circle
          cx={cx} cy={cx} r={r} fill="none" stroke="#C8F135" strokeWidth="9"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 2.5, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-black text-white leading-none"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: size * 0.24 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring", damping: 15 }}
        >
          {score}
        </motion.span>
        <span className="text-[#444] tracking-widest uppercase" style={{ fontSize: size * 0.07 }}>score</span>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  const params = useParams();
  const credentialId = params.id as string;
  const supabase = createClient();

  const [credential, setCredential] = useState<Credential | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verifyCount, setVerifyCount] = useState<number | null>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    loadCredential();
  }, [credentialId]);

  const loadCredential = async () => {
    if (!credentialId || credentialId === "demo") {
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

    // Log verification
    await supabase.from("verifications").insert({
      credential_id: credentialId,
      viewer_ip: "unknown",
      viewer_country: "unknown",
    }).then(() => {});

    // Get count
    const { count } = await supabase
      .from("verifications")
      .select("*", { count: "exact", head: true })
      .eq("credential_id", credentialId);

    setCredential(credData);
    setProfile(profileData);
    setVerifyCount(count ?? 1);
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#111] border-t-[#C8F135] rounded-full" />
        <p className="text-[#2a2a2a] text-xs tracking-widest uppercase"
          style={{ fontFamily: "'DM Mono', monospace" }}>Verifying credential</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center text-white px-5"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-[#C8F135] text-5xl mb-5">◈</p>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Credential not found</h1>
          <p className="text-[#444] text-sm mb-8">This credential may have been removed or made private.</p>
          <Link href="/">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="px-6 py-3 rounded-full bg-[#C8F135] text-black text-sm font-semibold">
              Go to EarnID →
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const cred = credential ?? {
    id: "demo", total_earned: 24800, consistency_score: 87,
    active_since: "2022-01-01", monthly_average: 2066,
    top_sources: ["Upwork", "Toptal", "Direct Client"],
    mint_address: "7xKpDemo3nRqABCDEF", tx_hash: null,
    is_public: true, created_at: new Date().toISOString(), user_id: "",
  };
  const prof = profile ?? { full_name: "Adaeze Okonkwo", profession: "UI/UX Designer" };
  const mintAddr = cred.mint_address
    ? `${cred.mint_address.slice(0, 8)}...${cred.mint_address.slice(-6)}`
    : "Pending";
  const minted = new Date(cred.created_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const since = new Date(cred.active_since).toLocaleDateString("en-US", {
    month: "short", year: "numeric",
  });
  const volumeScore = Math.min(Math.round((cred.total_earned / 10000) * 100), 100);
  const diversityScore = Math.min(cred.top_sources.length * 20, 100);

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <FloatingOrb x="5%" y="8%" size={400} delay={0} />
      <FloatingOrb x="65%" y="5%" size={300} delay={2} />
      <FloatingOrb x="35%" y="55%" size={450} delay={1} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 md:px-10 py-4 border-b border-[#111]"
        style={{ background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)" }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#C8F135] flex items-center justify-center">
            <span className="text-black text-xs font-black">E</span>
          </div>
          <span className="text-white font-extrabold text-base hidden sm:block"
            style={{ fontFamily: "'Syne', sans-serif" }}>EarnID</span>
        </Link>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#C8F135]/20 bg-[#C8F135]/5"
        >
          <motion.div className="w-2 h-2 rounded-full bg-[#C8F135]"
            animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <span className="text-[#C8F135] text-[10px] tracking-[0.2em] uppercase"
            style={{ fontFamily: "'DM Mono', monospace" }}>
            Verified
          </span>
        </motion.div>
        <Link href="/register">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="px-4 py-2 rounded-full bg-[#C8F135] text-black text-xs font-semibold hover:bg-[#d8ff40] transition-colors">
            Get EarnID →
          </motion.button>
        </Link>
      </nav>

      {/* Page content */}
      <div className="pt-24 pb-16 px-5 md:px-10 max-w-2xl mx-auto">

        {/* Top identity strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-[10px] tracking-[0.3em] text-[#333] uppercase mb-3"
            style={{ fontFamily: "'DM Mono', monospace" }}>
            Income Credential · Solana Devnet
          </p>
          <h1 className="font-extrabold mb-1"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem, 6vw, 3rem)" }}>
            {prof.full_name}
          </h1>
          <p className="text-[#555] text-sm mb-3">{prof.profession} · Nigeria</p>
          {verifyCount !== null && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#111] bg-[#0a0a0a]"
            >
              <span className="text-[#C8F135] text-[10px]">◈</span>
              <span className="text-[#333] text-[10px] tracking-widest uppercase"
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {verifyCount} verification{verifyCount !== 1 ? "s" : ""}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Credential card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mb-4"
        >
          <div className="absolute -inset-3 rounded-3xl opacity-15 blur-2xl pointer-events-none"
            style={{ background: "linear-gradient(135deg, #C8F135, transparent)" }} />

          <div className="relative rounded-2xl border border-[#1f1f1f] overflow-hidden"
            style={{ background: "linear-gradient(160deg, #111 0%, #0a0a0a 100%)" }}>
            <div className="absolute top-0 right-0 w-48 h-48 opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(circle at top right, #C8F135, transparent 70%)" }} />
            <div className="absolute bottom-0 left-0 w-36 h-36 opacity-5 pointer-events-none"
              style={{ background: "radial-gradient(circle at bottom left, #C8F135, transparent 70%)" }} />

            <div className="p-6 md:p-8">
              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#C8F135] flex items-center justify-center">
                    <span className="text-black text-[10px] font-black">E</span>
                  </div>
                  <span className="text-[10px] tracking-[0.2em] text-[#444] uppercase"
                    style={{ fontFamily: "'DM Mono', monospace" }}>EarnID</span>
                </div>
                <span className="text-[9px] tracking-[0.3em] text-[#C8F135] border border-[#C8F135]/20 px-2.5 py-1 rounded-full"
                  style={{ fontFamily: "'DM Mono', monospace" }}>VERIFIED</span>
              </div>

              <div className="mb-5">
                <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase mb-1">Income Credential</p>
                <h2 className="text-white text-2xl font-extrabold mb-0.5"
                  style={{ fontFamily: "'Syne', sans-serif" }}>{prof.full_name}</h2>
                <p className="text-[#555] text-xs">{prof.profession} · Nigeria</p>
              </div>

              {/* Score + stats */}
              <div className="flex items-center gap-5 mb-5">
                <ScoreRing score={cred.consistency_score} size={120} />
                <div className="space-y-3 flex-1 min-w-0">
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase">Total Verified</p>
                    <p className="text-white font-bold text-2xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                      ${cred.total_earned.toLocaleString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase">Avg / Month</p>
                      <p className="text-[#888] text-sm">${Math.round(cred.monthly_average).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase">Active Since</p>
                      <p className="text-[#888] text-sm">{since}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sources */}
              <div className="flex gap-2 flex-wrap mb-5">
                {cred.top_sources.map((s) => (
                  <span key={s}
                    className="text-[9px] tracking-wider px-3 py-1.5 rounded-full border border-[#202020] text-[#555]"
                    style={{ fontFamily: "'DM Mono', monospace" }}>{s}</span>
                ))}
              </div>

              {/* Score breakdown */}
              <div className="border border-[#111] rounded-xl p-4 mb-5" style={{ background: "#0a0a0a" }}>
                <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase mb-3">Score Breakdown</p>
                {[
                  { label: "Volume", weight: "40%", val: volumeScore },
                  { label: "Regularity", weight: "40%", val: Math.min(Math.round((new Set([since]).size / 12) * 100), 8) },
                  { label: "Diversity", weight: "20%", val: diversityScore },
                ].map((b, i) => (
                  <div key={b.label} className={i < 2 ? "mb-3" : ""}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#444] text-xs">{b.label} <span className="text-[#222]">· {b.weight}</span></span>
                      <span className="text-[#C8F135] text-xs font-mono">{b.val}</span>
                    </div>
                    <div className="h-1 bg-[#111] rounded-full overflow-hidden">
                      <motion.div className="h-full bg-[#C8F135] rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${b.val}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.15, ease: "easeOut" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-[#161616] pt-4">
                <div className="flex items-end justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] tracking-widest text-[#222] uppercase mb-1">On-chain proof</p>
                    <p className="text-[10px] text-[#3a3a3a] mb-0.5 truncate"
                      style={{ fontFamily: "'DM Mono', monospace" }}>SOL · {mintAddr}</p>
                    <p className="text-[9px] text-[#252525] truncate"
                      style={{ fontFamily: "'DM Mono', monospace" }}>
                      {typeof window !== "undefined" ? window.location.href.replace("https://", "") : ""}
                    </p>
                  </div>
                  <QRCodeDisplay value={typeof window !== "undefined" ? window.location.href : ""} size={44} />
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#111]">
                  <div>
                    <p className="text-[8px] tracking-widest text-[#1a1a1a] uppercase mb-0.5">Minted on</p>
                    <p className="text-[10px] text-[#252525]" style={{ fontFamily: "'DM Mono', monospace" }}>{minted}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] tracking-widest text-[#1a1a1a] uppercase mb-0.5">Network</p>
                    <p className="text-[10px] text-[#252525]" style={{ fontFamily: "'DM Mono', monospace" }}>Solana Devnet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl border text-sm font-medium transition-all"
            style={{
              background: copied ? "#0a1200" : "transparent",
              borderColor: copied ? "#1e2d00" : "#111",
              color: copied ? "#C8F135" : "#444",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            {copied ? "Copied!" : "Copy verification link"}
          </motion.button>
          <Link href="/register" className="block">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(200,241,53,0.15)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#C8F135] text-black text-sm font-semibold hover:bg-[#d8ff40] transition-all"
            >
              Get your own EarnID →
            </motion.button>
          </Link>
        </motion.div>

        {/* Why trust strip */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="border border-[#0e0e0e] rounded-xl p-5" style={{ background: "#0a0a0a" }}
        >
          <p className="text-[9px] tracking-[0.3em] text-[#1e1e1e] uppercase mb-5 text-center">
            Why trust this credential?
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: "◈", title: "On-chain", desc: "Minted on Solana. Immutable and tamper-proof forever." },
              { icon: "◎", title: "Verifiable", desc: "Anyone can verify this URL. No login required." },
              { icon: "⬡", title: "Aggregated", desc: "Income from multiple verified sources, combined." },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <span className="text-[#C8F135] text-base block mb-2">{item.icon}</span>
                <p className="text-white text-xs font-semibold mb-1"
                  style={{ fontFamily: "'Syne', sans-serif" }}>{item.title}</p>
                <p className="text-[#222] text-[10px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#0d0d0d] px-5 md:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#C8F135] flex items-center justify-center">
            <span className="text-black text-[9px] font-black">E</span>
          </div>
          <span className="font-bold text-xs text-[#222]" style={{ fontFamily: "'Syne', sans-serif" }}>EarnID</span>
        </div>
        <p className="text-[#181818] text-[10px] tracking-widest uppercase text-center">
          Built on Solana · Powered by Raenest · Superteam Nigeria
        </p>
        <Link href="/register">
          <span className="text-[#222] text-xs hover:text-[#C8F135] transition-colors cursor-pointer">
            Build your income identity →
          </span>
        </Link>
      </footer>
    </div>
  );
}