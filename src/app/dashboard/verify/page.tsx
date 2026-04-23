"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import ConnectWalletButton from "@/components/ConnectWalletButton";

interface Credential {
  id: string;
  total_earned: number;
  consistency_score: number;
  is_public: boolean;
  created_at: string;
}
interface Profile { full_name: string; profession: string; }
interface Verification { id: string; viewed_at: string; }

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
function CopyIcon() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function ExternalLinkIcon() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M8 1h3v3M11 1L6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function PlaneIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d=" M 115 60 C 110 52 95 58 80 58 L 64 58 L 44 18 L 32 18 L 46 58 L 10 58 L 0 42 L -8 42 L -4 58 L -8 60 L -4 62 L -8 78 L 0 78 L 10 62 L 46 62 L 32 102 L 44 102 L 64 62 L 80 62 C 95 62 110 68 115 60 Z" transform="translate(5,0)"/></svg>;
}

const NAV_ITEMS = [
  { icon: GridIcon, label: "Overview", href: "/dashboard" },
  { icon: TrendingIcon, label: "Earnings", href: "/dashboard/earnings" },
  { icon: BadgeIcon, label: "Credentials", href: "/dashboard/credentials" },
  { icon: ShareIcon, label: "Verify", href: "/dashboard/verify" },
  { icon: SettingsIcon, label: "Settings", href: "/dashboard/settings" },
];

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

// Toggle Switch
function Toggle({ on, onChange, loading }: { on: boolean; onChange: () => void; loading: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      className="relative flex-shrink-0 focus:outline-none disabled:cursor-not-allowed"
      aria-label="Toggle visibility"
      style={{ width: 44, height: 24 }}
    >
      <motion.div
        animate={{ background: on ? "#C8F135" : "#1a1a1a" }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 rounded-full border"
        style={{ borderColor: on ? "transparent" : "#2a2a2a" }}
      />
      <motion.div
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: "spring", damping: 20, stiffness: 400 }}
        className="absolute top-1 w-4 h-4 rounded-full shadow-sm"
        style={{ background: on ? "#000" : "#444" }}
      />
    </button>
  );
}

export default function DashboardVerifyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [toggling, setToggling] = useState(false);

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

    const [{ data: profileData }, { data: credData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("credentials").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
    ]);

    setProfile(profileData);
    const cred = credData?.[0] ?? null;
    setCredential(cred);

    if (cred) {
      const { data: verifyData } = await supabase
        .from("verifications")
        .select("*")
        .eq("credential_id", cred.id)
        .order("viewed_at", { ascending: false })
        .limit(50);
      setVerifications(verifyData ?? []);
    }
    setLoading(false);
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push("/"); };

  const handleCopy = () => {
    if (!credential) return;
    navigator.clipboard.writeText(`${window.location.origin}/verify/${credential.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async () => {
    if (!credential) return;
    setToggling(true);
    await supabase.from("credentials").update({ is_public: !credential.is_public }).eq("id", credential.id);
    setCredential((c) => c ? { ...c, is_public: !c.is_public } : c);
    setToggling(false);
  };

  const verifyUrl = credential
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${credential.id}`
    : "";

  // Group verifications by date
  const grouped = verifications.reduce((acc, v) => {
    const date = new Date(v.viewed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    if (!acc[date]) acc[date] = [];
    acc[date].push(v);
    return acc;
  }, {} as Record<string, Verification[]>);

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
        <Sidebar profile={profile} active="Verify" onSignOut={handleSignOut} />
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
              <Sidebar profile={profile} active="Verify" onSignOut={handleSignOut} mobile onClose={() => setMobileSidebar(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-8 py-4 border-b border-[#111]"
          style={{ background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden text-[#444] hover:text-white transition-colors" onClick={() => setMobileSidebar(true)}>
              <MenuIcon />
            </button>
            <div>
              <h1 className="text-white font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Verify</h1>
              <p className="text-[#2a2a2a] text-xs hidden md:block">Your shareable income proof</p>
            </div>
          </div>
          {credential && (
            <Link href={`/verify/${credential.id}`} target="_blank">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#1a1a1a] text-[#555] text-xs hover:text-white hover:border-[#2a2a2a] transition-all">
                <ExternalLinkIcon />
                <span className="hidden sm:inline">View public page</span>
              </motion.button>
            </Link>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 px-5 md:px-8 py-6 max-w-4xl mx-auto w-full">

          {!credential ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-24">
              <p className="text-[#1a1a1a] text-5xl mb-5">◈</p>
              <h2 className="text-white font-bold text-xl mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                No credential minted yet
              </h2>
              <p className="text-[#333] text-sm mb-7">Mint your credential first to get a shareable verification link.</p>
              <Link href="/dashboard/credentials">
                <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(200,241,53,0.15)" }} whileTap={{ scale: 0.96 }}
                  className="px-7 py-3 rounded-full bg-[#C8F135] text-black text-sm font-semibold hover:bg-[#d8ff40] transition-all">
                  Mint Credential →
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-5">

              {/* TOP ROW: Share link + QR */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Share link card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-2 border border-[#141414] rounded-2xl p-6"
                  style={{ background: "#0a0a0a" }}>

                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="text-[10px] tracking-[0.2em] text-[#333] uppercase mb-1">Verification Link</p>
                      <p className="text-white font-semibold text-base" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Share your income proof
                      </p>
                    </div>
                    {/* Visibility toggle */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs" style={{
                        color: credential.is_public ? "#C8F135" : "#333",
                        fontFamily: "'DM Mono', monospace",
                      }}>
                        {credential.is_public ? "Public" : "Private"}
                      </span>
                      <Toggle on={credential.is_public} onChange={handleToggle} loading={toggling} />
                    </div>
                  </div>

                  {/* URL box */}
                  <div className="flex items-center gap-2 p-3.5 rounded-xl border border-[#111] mb-4"
                    style={{ background: "#080808" }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: credential.is_public ? "#C8F135" : "#333" }} />
                    <p className="flex-1 text-xs truncate"
                      style={{ color: credential.is_public ? "#555" : "#2a2a2a", fontFamily: "'DM Mono', monospace" }}>
                      {verifyUrl}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={handleCopy}
                      disabled={!credential.is_public}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        background: copied ? "#0f1a00" : "#111",
                        color: copied ? "#C8F135" : "#666",
                        border: `1px solid ${copied ? "#1e2d00" : "#1a1a1a"}`,
                      }}
                    >
                      <CopyIcon />
                      {copied ? "Copied!" : "Copy"}
                    </motion.button>
                  </div>

                  {/* Quick share destinations */}
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-[#222] uppercase mb-3">Share with</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Visa Applications", icon: <PlaneIcon /> },
                        { label: "Client Proposals", icon: "◈" },
                        { label: "Loan Applications", icon: "◎" },
                        { label: "LinkedIn Profile", icon: "⬡" },
                      ].map((item) => (
                        <motion.button
                          key={item.label}
                          whileHover={{ x: 3 }}
                          onClick={handleCopy}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[#111] hover:border-[#1e1e1e] transition-all text-left group"
                          style={{ background: "#080808" }}
                        >
                          <span className="text-[#222] group-hover:text-[#C8F135] transition-colors text-sm flex-shrink-0">
                            {item.icon}
                          </span>
                          <span className="text-[#333] group-hover:text-white text-xs transition-colors truncate">
                            {item.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* QR code card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                  className="border border-[#141414] rounded-2xl p-6 flex flex-col items-center justify-between"
                  style={{ background: "#0a0a0a" }}>
                  <p className="text-[10px] tracking-[0.2em] text-[#333] uppercase mb-5 self-start">QR Code</p>

                  {/* QR */}
                  <QRCodeDisplay value={verifyUrl} size={144} bgColor="#ffffff" fgColor="#000000" />

                  <div className="text-center mt-4">
                    <p className="text-[#333] text-xs mb-0.5">Scan to verify</p>
                    <p className="text-[#1e1e1e] text-[10px]" style={{ fontFamily: "'DM Mono', monospace" }}>
                      earnid.app/verify/...
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* STATS ROW  */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total Verifications", value: verifications.length, accent: verifications.length > 0 },
                  { label: "Consistency Score", value: credential.consistency_score, accent: false },
                  { label: "Total Earned", value: `$${credential.total_earned.toLocaleString()}`, accent: false },
                  { label: "Minted", value: new Date(credential.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }), accent: false },
                ].map((s, i) => (
                  <motion.div key={s.label}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                    className="border border-[#141414] rounded-xl p-4 relative overflow-hidden"
                    style={{ background: s.accent ? "linear-gradient(135deg, #0a1200 0%, #080808 100%)" : "#0a0a0a" }}>
                    {s.accent && (
                      <div className="absolute top-0 right-0 w-16 h-16 opacity-20 pointer-events-none"
                        style={{ background: "radial-gradient(circle at top right, #C8F135, transparent 70%)" }} />
                    )}
                    <p className="text-[9px] tracking-[0.2em] text-[#2a2a2a] uppercase mb-2">{s.label}</p>
                    <p className="font-extrabold text-2xl leading-none"
                      style={{ fontFamily: "'Syne', sans-serif", color: s.accent ? "#C8F135" : "white" }}>
                      {s.value}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* VERIFICATION HISTORY */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                className="border border-[#141414] rounded-2xl overflow-hidden"
                style={{ background: "#0a0a0a" }}>

                <div className="flex items-center justify-between px-6 py-4 border-b border-[#0d0d0d]">
                  <p className="text-[10px] tracking-[0.2em] text-[#333] uppercase">Verification History</p>
                  {verifications.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C8F135]" />
                      <span className="text-[#C8F135] text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {verifications.length} total
                      </span>
                    </div>
                  )}
                </div>

                {verifications.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-[#1a1a1a] text-4xl mb-3">◎</p>
                    <p className="text-[#222] text-sm mb-1">No verifications yet</p>
                    <p className="text-[#181818] text-xs">Every time someone opens your link, it appears here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#0a0a0a]">
                    {Object.entries(grouped).map(([date, items]) => (
                      <div key={date}>
                        {/* Date header */}
                        <div className="px-6 py-2 bg-[#080808] border-b border-[#0d0d0d]">
                          <p className="text-[9px] tracking-[0.2em] text-[#222] uppercase"
                            style={{ fontFamily: "'DM Mono', monospace" }}>{date}</p>
                        </div>
                        {items.map((v, i) => (
                          <motion.div
                            key={v.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-center gap-4 px-6 py-3.5 hover:bg-[#0d0d0d] transition-colors group"
                          >
                            {/* Icon */}
                            <div className="w-8 h-8 rounded-lg border border-[#141414] flex items-center justify-center flex-shrink-0 group-hover:border-[#1e1e1e] transition-colors"
                              style={{ background: "#0d0d0d" }}>
                              <span className="text-[#C8F135] text-xs">◎</span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium">Credential verified</p>
                              <p className="text-[#2a2a2a] text-[10px]"
                                style={{ fontFamily: "'DM Mono', monospace" }}>
                                Someone opened your verification link
                              </p>
                            </div>

                            <p className="text-[#1e1e1e] text-xs flex-shrink-0"
                              style={{ fontFamily: "'DM Mono', monospace" }}>
                              {new Date(v.viewed_at).toLocaleTimeString("en-US", {
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}