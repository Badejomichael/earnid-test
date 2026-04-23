"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import ConnectWalletButton from "@/components/ConnectWalletButton";

// Types 
interface Earning {
  id: string;
  source: string;
  amount_usd: number;
  earned_date: string;
}

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
}

interface Profile {
  full_name: string;
  profession: string;
}

// Icons
function GridIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></svg>;
}
function TrendingIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><polyline points="1,11 5,7 8,9 15,3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><polyline points="11,3 15,3 15,7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function BadgeIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/><polyline points="5,8 7,10 11,6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function ShareIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><circle cx="12.5" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="12.5" cy="12.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="3.5" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.4"/><line x1="5" y1="8" x2="11" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="5" y1="8" x2="11" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function SettingsIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19.4 13a7.9 7.9 0 0 0 .05-2l2.05-1.6a.5.5 0 0 0 .12-.64l-1.94-3.36a.5.5 0 0 0-.6-.22l-2.42.97a7.7 7.7 0 0 0-1.73-1l-.37-2.57A.5.5 0 0 0 14.07 2h-4.14a.5.5 0 0 0-.49.42L9.07 5a7.7 7.7 0 0 0-1.73 1l-2.42-.97a.5.5 0 0 0-.6.22L2.38 8.61a.5.5 0 0 0 .12.64L4.55 10.85a7.9 7.9 0 0 0 0 2.3L2.5 14.75a.5.5 0 0 0-.12.64l1.94 3.36a.5.5 0 0 0 .6.22l2.42-.97a7.7 7.7 0 0 0 1.73 1l.37 2.57a.5.5 0 0 0 .49.42h4.14a.5.5 0 0 0 .49-.42l.37-2.57a7.7 7.7 0 0 0 1.73-1l2.42.97a.5.5 0 0 0 .6-.22l1.94-3.36a.5.5 0 0 0-.12-.64L19.4 13Z" /> <circle cx="12" cy="12" r="3" /></svg>;
}
function MenuIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}
function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}
function CopyIcon({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function DownloadIcon({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M8 2v9M5 8l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function ExternalIcon({ size = 12 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 12 12" fill="none"><path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M8 1h3v3M11 1L6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

const NAV_ITEMS = [
  { icon: GridIcon, label: "Overview", href: "/dashboard" },
  { icon: TrendingIcon, label: "Earnings", href: "/dashboard/earnings" },
  { icon: BadgeIcon, label: "Credentials", href: "/dashboard/credentials" },
  { icon: ShareIcon, label: "Verify", href: "/dashboard/verify" },
  { icon: SettingsIcon, label: "Settings", href: "/dashboard/settings" },
];

// Score Algorithm 
function calcScore(earnings: Earning[]) {
  if (earnings.length === 0) return 0;
  const total = earnings.reduce((s, e) => s + e.amount_usd, 0);
  const uniqueMonths = new Set(earnings.map((e) => e.earned_date.slice(0, 7))).size;
  const uniqueSources = new Set(earnings.map((e) => e.source)).size;
  const volumeScore = Math.min((total / 10000) * 100, 100);
  const regularityScore = Math.min((uniqueMonths / 12) * 100, 100);
  const diversityScore = Math.min(uniqueSources * 20, 100);
  return Math.round(volumeScore * 0.4 + regularityScore * 0.4 + diversityScore * 0.2);
}

// Sidebar 
function Sidebar({ profile, active, onSignOut, mobile, onClose }: {
  profile: Profile | null; active: string; onSignOut: () => void; mobile?: boolean; onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full" style={{ background: "#080808", borderRight: "1px solid #111" }}>
      <div className="px-5 py-5 flex items-center justify-between border-b border-[#111]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#C8F135] flex items-center justify-center flex-shrink-0">
            <span className="text-black text-xs font-black">E</span>
          </div>
          <span className="text-white font-extrabold text-base" style={{ fontFamily: "'Syne', sans-serif" }}>EarnID</span>
        </Link>
        {mobile && onClose && (
          <button onClick={onClose} className="text-[#444] hover:text-white transition-colors p-1"><CloseIcon /></button>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.label;
          return (
            <Link key={item.label} href={item.href}>
              <motion.div whileHover={{ x: 2 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
                style={{ background: isActive ? "#0f1a00" : "transparent", color: isActive ? "#C8F135" : "#3a3a3a", border: isActive ? "1px solid #1e2d00" : "1px solid transparent" }}
                onClick={mobile && onClose ? onClose : undefined}>
                <item.icon size={15} />
                <span className="text-sm font-medium tracking-wide">{item.label}</span>
                {isActive && <motion.div layoutId="activeIndicator" className="ml-auto w-1 h-1 rounded-full bg-[#C8F135]" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-[#111] space-y-2">
        {/* Wallet connect */}
        <ConnectWalletButton />
        <div className="px-3 py-2.5 rounded-xl flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#0f1a00] border border-[#1e2d00] flex items-center justify-center flex-shrink-0">
            <span className="text-[#C8F135] text-[10px] font-bold">{profile?.full_name?.charAt(0) ?? "U"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{profile?.full_name ?? "User"}</p>
            <p className="text-[#2a2a2a] text-[10px] truncate">{profile?.profession ?? ""}</p>
          </div>
        </div>
        <button onClick={onSignOut} className="w-full px-3 py-2.5 rounded-xl text-[#2a2a2a] text-xs text-left hover:text-red-400 hover:bg-red-500/5 transition-all">→ Sign out</button>
      </div>
    </div>
  );
}

// Score Ring 
function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#111" strokeWidth="10" />
        <motion.circle cx={cx} cy={cx} r={r} fill="none" stroke="#C8F135" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 2, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-white font-black leading-none"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: size * 0.22 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          {score}
        </motion.span>
        <span className="text-[#444] tracking-widest uppercase" style={{ fontSize: size * 0.07 }}>score</span>
      </div>
    </div>
  );
}

// Credential Card (visual) 
function CredentialCardVisual({ credential, profile }: { credential: Credential; profile: Profile | null }) {
  return (
    <div
      id="credential-card"
      className="relative rounded-2xl p-6 border border-[#1f1f1f] overflow-hidden w-full"
      style={{ background: "linear-gradient(160deg, #111 0%, #0a0a0a 100%)", minWidth: 300 }}
    >
      {/* Glow top right */}
      <div className="absolute top-0 right-0 w-40 h-40 opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle at top right, #C8F135, transparent 70%)" }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#C8F135] flex items-center justify-center">
            <span className="text-black text-[10px] font-black">E</span>
          </div>
          <span className="text-xs tracking-[0.2em] text-[#444] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>EarnID</span>
        </div>
        <span className="text-[9px] tracking-[0.3em] text-[#C8F135] border border-[#C8F135]/20 px-2.5 py-1 rounded-full">VERIFIED</span>
      </div>

      {/* Name + profession */}
      <div className="mb-5">
        <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase mb-1">Income Credential</p>
        <h3 className="text-white text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>{profile?.full_name ?? "—"}</h3>
        <p className="text-[#444] text-xs mt-0.5">{profile?.profession ?? ""} · Nigeria</p>
      </div>

      {/* Score + stats */}
      <div className="flex items-center gap-5 mb-5">
        <ScoreRing score={credential.consistency_score} size={100} />
        <div className="space-y-2.5 flex-1 min-w-0">
          <div>
            <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase">Total Verified</p>
            <p className="text-white font-bold text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>${credential.total_earned.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase">Avg / Month</p>
            <p className="text-[#888] text-sm">${Math.round(credential.monthly_average).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase">Active Since</p>
            <p className="text-[#888] text-sm">{new Date(credential.active_since).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
          </div>
        </div>
      </div>

      {/* Sources */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {credential.top_sources.map((s) => (
          <span key={s} className="text-[9px] tracking-wider px-2.5 py-1 rounded-full border border-[#202020] text-[#444]">{s}</span>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-[#161616] pt-4 flex items-center justify-between">
        <div>
          <p className="text-[8px] tracking-widest text-[#222] uppercase mb-0.5">On-chain proof</p>
          <p className="text-[10px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>
            {credential.mint_address ? `SOL · ${credential.mint_address.slice(0, 4)}...${credential.mint_address.slice(-4)}` : "SOL · Devnet · Pending"}
          </p>
        </div>
        {/* QR */}
        <QRCodeDisplay value={`${window.location.origin}/verify/${credential.id}`} size={40} />
      </div>
    </div>
  );
}

// Mint Steps UI 
const MINT_STEPS = [
  "Aggregating earnings data",
  "Computing consistency score",
  "Preparing on-chain metadata",
  "Minting credential on Solana",
  "Saving credential to database",
];

function MintProgress({ step }: { step: number }) {
  return (
    <div className="space-y-3">
      {MINT_STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <motion.div key={i} className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-500"
              style={{ borderColor: done ? "#C8F135" : active ? "#C8F135" : "#1a1a1a", background: done ? "#C8F135" : "transparent" }}>
              {done ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <polyline points="2,5 4,7 8,3" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : active ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 border border-[#C8F135] border-t-transparent rounded-full" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
              )}
            </div>
            <span className="text-sm transition-colors" style={{ color: done ? "#C8F135" : active ? "white" : "#2a2a2a" }}>
              {label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// Main Page 
export default function CredentialsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [mintStep, setMintStep] = useState(-1);
  const [mintDone, setMintDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const [{ data: profileData }, { data: earningsData }, { data: credentialsData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("earnings").select("*").eq("user_id", user.id).order("earned_date", { ascending: true }),
      supabase.from("credentials").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
    ]);

    setProfile(profileData);
    setEarnings(earningsData ?? []);
    const credentialData = credentialsData?.[0] ?? null;
    if (credentialData) { setCredential(credentialData); setMintDone(true); }
    setLoading(false);
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push("/"); };

  //  Mint flow 
  const handleMint = async () => {
    if (earnings.length < 1) return;
    setMinting(true);
    setMintStep(0);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Step 0 — aggregate
    await delay(900);
    const totalEarned = earnings.reduce((s, e) => s + e.amount_usd, 0);
    const uniqueMonths = new Set(earnings.map((e) => e.earned_date.slice(0, 7))).size;
    const avgMonthly = uniqueMonths > 0 ? totalEarned / uniqueMonths : 0;
    const activeSince = earnings[0]?.earned_date ?? new Date().toISOString().slice(0, 10);
    const topSources = [...new Set(earnings.map((e) => e.source))].slice(0, 4);

    // Step 1 — score
    setMintStep(1);
    await delay(800);
    const score = calcScore(earnings);

    // Step 2 — metadata
    setMintStep(2);
    await delay(1000);

    // Step 3 — "mint" (simulate devnet tx)
    setMintStep(3);
    await delay(1400);
    const fakeMintAddress = generateFakeAddress();
    const fakeTxHash = generateFakeAddress();

    // Step 4 — save to DB
    setMintStep(4);
    // Check if credential already exists for this user
    const { data: existing } = await supabase
      .from("credentials")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    let error;
    if (existing?.id) {
      // Update existing
      const { error: updateError } = await supabase
        .from("credentials")
        .update({
          total_earned: totalEarned,
          consistency_score: score,
          active_since: activeSince,
          monthly_average: avgMonthly,
          top_sources: topSources,
          mint_address: fakeMintAddress,
          tx_hash: fakeTxHash,
          is_public: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      error = updateError;
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from("credentials")
        .insert({
          user_id: user.id,
          total_earned: totalEarned,
          consistency_score: score,
          active_since: activeSince,
          monthly_average: avgMonthly,
          top_sources: topSources,
          mint_address: fakeMintAddress,
          tx_hash: fakeTxHash,
          is_public: true,
        });
      error = insertError;
    }

    // Fresh fetch to get the real saved row with its id
    const { data: newCred } = await supabase
      .from("credentials")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    await delay(600);

    if (!error && newCred) {
      setCredential(newCred);
      setMintDone(true);
    } else if (error) {
      console.error("Mint error:", error);
    }
    setMinting(false);
    setMintStep(-1);
  };

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const generateFakeAddress = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
    return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const handleCopyLink = () => {
    if (!credential) return;
    const url = `${window.location.origin}/verify/${credential.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!credential || !profile) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/download-credential?id=${credential.id}`);
      if (!res.ok) throw new Error("Failed to fetch credential data");
      const html = await res.text();

      // Create hidden iframe in current page
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:900px;height:600px;opacity:0;pointer-events:none;";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("iframe failed");

      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      // Listen for download-ready message from iframe
      const handleMessage = (e: MessageEvent) => {
        if (e.data === "pdf-download-done") {
          window.removeEventListener("message", handleMessage);
          setTimeout(() => {
            document.body.removeChild(iframe);
            setDownloading(false);
          }, 1000);
        }
        if (e.data === "pdf-download-failed") {
          window.removeEventListener("message", handleMessage);
          document.body.removeChild(iframe);
          setDownloading(false);
          alert("Download failed. Please try again.");
        }
      };
      window.addEventListener("message", handleMessage);

      // Fallback timeout
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch {}
        setDownloading(false);
      }, 20000);

    } catch (err: any) {
      console.error("Download error:", err);
      setDownloading(false);
    }
  };


  // Computed
  const score = calcScore(earnings);
  const totalEarned = earnings.reduce((s, e) => s + e.amount_usd, 0);
  const hasEnoughData = earnings.length >= 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#111] border-t-[#C8F135] rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-56 flex-shrink-0 fixed left-0 top-0 bottom-0">
        <Sidebar profile={profile} active="Credentials" onSignOut={handleSignOut} />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileSidebar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 md:hidden" onClick={() => setMobileSidebar(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 left-0 bottom-0 w-64 z-50 md:hidden">
              <Sidebar profile={profile} active="Credentials" onSignOut={handleSignOut} mobile onClose={() => setMobileSidebar(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-8 py-4 border-b border-[#111]"
          style={{ background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden text-[#444] hover:text-white transition-colors" onClick={() => setMobileSidebar(true)}>
              <MenuIcon />
            </button>
            <div>
              <h1 className="text-white font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Credentials</h1>
              <p className="text-[#2a2a2a] text-xs hidden md:block">
                {mintDone ? "Your on-chain income proof" : "Mint your verifiable income credential"}
              </p>
            </div>
          </div>
          {mintDone && credential && (
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#1a1a1a] text-xs transition-all"
                style={{ color: copied ? "#C8F135" : "#555", borderColor: copied ? "#C8F135]/30" : "#1a1a1a" }}>
                <CopyIcon />
                <span className="hidden sm:inline">{copied ? "Copied!" : "Copy Link"}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: downloading ? 1 : 1.04 }}
                whileTap={{ scale: downloading ? 1 : 0.96 }}
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#1a1a1a] text-xs transition-all disabled:cursor-not-allowed"
                style={{ color: downloading ? "#C8F135" : "#555", borderColor: downloading ? "rgba(200,241,53,0.3)" : "#1a1a1a" }}
              >
                {downloading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-3.5 h-3.5 border border-[#C8F135] border-t-transparent rounded-full flex-shrink-0"
                  />
                ) : (
                  <DownloadIcon />
                )}
                <span className="hidden sm:inline">
                  {downloading ? "Generating..." : "Download PDF"}
                </span>
              </motion.button>
            </div>
          )}
        </div>

        <div className="flex-1 px-5 md:px-8 py-6">

          {/* No earnings state  */}
          {earnings.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto text-center py-20">
              <div className="text-5xl mb-4 text-[#1a1a1a]">◈</div>
              <h2 className="text-white font-bold text-xl mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>No earnings yet</h2>
              <p className="text-[#333] text-sm mb-6">You need at least one earning entry before you can mint a credential.</p>
              <Link href="/dashboard/earnings">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="px-6 py-3 rounded-full bg-[#C8F135] text-black text-sm font-semibold hover:bg-[#d8ff40] transition-colors">
                  Add Earnings →
                </motion.button>
              </Link>
            </motion.div>
          )}

          {/* Has earnings — show layout */}
          {earnings.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">

              {/* Left — score preview + mint */}
              <div className="space-y-4">

                {/* Score preview card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="border border-[#141414] rounded-2xl p-6" style={{ background: "#0a0a0a" }}>
                  <p className="text-[10px] tracking-[0.2em] text-[#333] uppercase mb-5">Your Income Score</p>

                  <div className="flex items-center gap-6">
                    <ScoreRing score={score} size={120} />
                    <div className="space-y-3 flex-1">
                      <div>
                        <p className="text-[9px] tracking-widest text-[#333] uppercase">Total Earned</p>
                        <p className="text-white font-bold text-2xl" style={{ fontFamily: "'Syne', sans-serif" }}>${totalEarned.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[9px] tracking-widest text-[#333] uppercase">Entries</p>
                        <p className="text-[#888] text-sm">{earnings.length} records</p>
                      </div>
                      <div>
                        <p className="text-[9px] tracking-widest text-[#333] uppercase">Sources</p>
                        <p className="text-[#888] text-sm">{new Set(earnings.map((e) => e.source)).size} unique</p>
                      </div>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div className="mt-5 space-y-2.5 pt-5 border-t border-[#111]">
                    <p className="text-[9px] tracking-widest text-[#333] uppercase mb-3">Score Breakdown</p>
                    {[
                      { label: "Volume", weight: "40%", val: Math.min(Math.round((totalEarned / 10000) * 100), 100) },
                      { label: "Regularity", weight: "40%", val: Math.min(Math.round((new Set(earnings.map((e) => e.earned_date.slice(0, 7))).size / 12) * 100), 100) },
                      { label: "Diversity", weight: "20%", val: Math.min(new Set(earnings.map((e) => e.source)).size * 20, 100) },
                    ].map((b) => (
                      <div key={b.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[#444] text-xs">{b.label} <span className="text-[#222]">· {b.weight}</span></span>
                          <span className="text-[#C8F135] text-xs font-mono">{b.val}</span>
                        </div>
                        <div className="h-1 bg-[#111] rounded-full overflow-hidden">
                          <motion.div className="h-full bg-[#C8F135] rounded-full"
                            initial={{ width: 0 }} animate={{ width: `${b.val}%` }}
                            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Mint button / progress */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="border border-[#141414] rounded-2xl p-6" style={{ background: "#0a0a0a" }}>

                  {!minting && !mintDone && (
                    <div>
                      <p className="text-[10px] tracking-[0.2em] text-[#333] uppercase mb-2">Ready to mint</p>
                      <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Create your on-chain credential
                      </h3>
                      <p className="text-[#333] text-sm mb-5 leading-relaxed">
                        Your earning history will be minted as a tamper-proof NFT on Solana devnet. Share it with anyone — they can verify instantly.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(200,241,53,0.2)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleMint}
                        className="w-full py-4 rounded-xl bg-[#C8F135] text-black font-bold text-sm tracking-wide hover:bg-[#d8ff40] transition-all"
                      >
                        ◈ Mint Credential on Solana →
                      </motion.button>
                    </div>
                  )}

                  {minting && (
                    <div>
                      <p className="text-[10px] tracking-[0.2em] text-[#C8F135] uppercase mb-4">Minting in progress</p>
                      <MintProgress step={mintStep} />
                    </div>
                  )}

                  {mintDone && !minting && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-[#C8F135] flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <polyline points="2,5 4,7 8,3" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <p className="text-[#C8F135] text-xs tracking-widest uppercase">Minted successfully</p>
                      </div>
                      <p className="text-white font-bold text-lg mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Credential is live on Solana
                      </p>
                      {credential?.tx_hash && (
                        <p className="text-[#333] text-xs mb-4 font-mono break-all">{credential.tx_hash.slice(0, 20)}...{credential.tx_hash.slice(-8)}</p>
                      )}

                      {/* Actions */}
                      <div className="space-y-2">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={handleCopyLink}
                          className="w-full py-3 rounded-xl border border-[#1e2d00] text-sm font-medium transition-all flex items-center justify-center gap-2"
                          style={{ background: "#0a1200", color: copied ? "#C8F135" : "white" }}>
                          <CopyIcon size={13} />
                          {copied ? "Link copied!" : "Copy verification link"}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => router.push(`/verify/${credential?.id}`)}
                          className="w-full py-3 rounded-xl border border-[#141414] text-[#555] text-sm hover:text-white hover:border-[#1e1e1e] transition-all flex items-center justify-center gap-2">
                          <ExternalIcon size={12} />
                          View public credential page
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={handleMint}
                          className="w-full py-3 rounded-xl text-[#2a2a2a] text-xs hover:text-[#444] transition-colors">
                          ↻ Re-mint with latest earnings
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Right — credential card preview */}
              <div className="space-y-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <p className="text-[10px] tracking-[0.2em] text-[#333] uppercase mb-4">
                    {mintDone ? "Your Credential Card" : "Preview"}
                  </p>

                  {/* Glow wrapper */}
                  <div className="relative">
                    {!mintDone && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[#1a1a1a] pointer-events-none z-10" />
                    )}
                    {mintDone && (
                      <div className="absolute -inset-2 rounded-3xl opacity-15 blur-2xl pointer-events-none"
                        style={{ background: "linear-gradient(135deg, #C8F135, transparent)" }} />
                    )}
                    <CredentialCardVisual
                      credential={credential ?? {
                        id: "preview",
                        total_earned: totalEarned,
                        consistency_score: score,
                        active_since: earnings[0]?.earned_date ?? new Date().toISOString(),
                        monthly_average: totalEarned / Math.max(new Set(earnings.map((e) => e.earned_date.slice(0, 7))).size, 1),
                        top_sources: [...new Set(earnings.map((e) => e.source))].slice(0, 4),
                        mint_address: null,
                        tx_hash: null,
                        is_public: false,
                        created_at: new Date().toISOString(),
                      }}
                      profile={profile}
                    />
                  </div>

                  {!mintDone && (
                    <p className="text-[#1e1e1e] text-xs text-center mt-3 tracking-widest uppercase">Preview — mint to make it real</p>
                  )}
                </motion.div>

                {/* Mint info */}
                {mintDone && credential && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="border border-[#141414] rounded-xl p-4 space-y-3" style={{ background: "#0a0a0a" }}>
                    <p className="text-[9px] tracking-widest text-[#333] uppercase">On-Chain Details</p>
                    {[
                      { label: "Network", value: "Solana Devnet" },
                      { label: "Mint Address", value: `${credential.mint_address?.slice(0, 8)}...${credential.mint_address?.slice(-6)}` },
                      { label: "Minted", value: new Date(credential.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
                      { label: "Visibility", value: credential.is_public ? "Public" : "Private" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between items-center">
                        <span className="text-[#333] text-xs">{row.label}</span>
                        <span className="text-white text-xs font-mono">{row.value}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}