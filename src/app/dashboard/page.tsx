"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ConnectWalletButton from "@/components/ConnectWalletButton";

// Types
interface Earning {
  id: string;
  source: string;
  amount_usd: number;
  currency: string;
  earned_date: string;
  description?: string;
}

interface Profile {
  full_name: string;
  profession: string;
  wallet_address?: string;
}

// Constants
const NAV_ITEMS = [
  { icon: GridIcon, label: "Overview", href: "/dashboard" },
  { icon: TrendingIcon, label: "Earnings", href: "/dashboard/earnings" },
  { icon: BadgeIcon, label: "Credentials", href: "/dashboard/credentials" },
  { icon: ShareIcon, label: "Verify", href: "/dashboard/verify" },
  { icon: SettingsIcon, label: "Settings", href: "/dashboard/settings" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// SVG Icons
function GridIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}
function TrendingIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <polyline points="1,11 5,7 8,9 15,3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="11,3 15,3 15,7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function BadgeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
      <polyline points="5,8 7,10 11,6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ShareIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="12.5" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="12.5" cy="12.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="3.5" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <line x1="5" y1="8" x2="11" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="5" y1="8" x2="11" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function SettingsIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19.4 13a7.9 7.9 0 0 0 .05-2l2.05-1.6a.5.5 0 0 0 .12-.64l-1.94-3.36a.5.5 0 0 0-.6-.22l-2.42.97a7.7 7.7 0 0 0-1.73-1l-.37-2.57A.5.5 0 0 0 14.07 2h-4.14a.5.5 0 0 0-.49.42L9.07 5a7.7 7.7 0 0 0-1.73 1l-2.42-.97a.5.5 0 0 0-.6.22L2.38 8.61a.5.5 0 0 0 .12.64L4.55 10.85a7.9 7.9 0 0 0 0 2.3L2.5 14.75a.5.5 0 0 0-.12.64l1.94 3.36a.5.5 0 0 0 .6.22l2.42-.97a7.7 7.7 0 0 0 1.73 1l.37 2.57a.5.5 0 0 0 .49.42h4.14a.5.5 0 0 0 .49-.42l.37-2.57a7.7 7.7 0 0 0 1.73-1l2.42.97a.5.5 0 0 0 .6-.22l1.94-3.36a.5.5 0 0 0-.12-.64L19.4 13Z" /> <circle cx="12" cy="12" r="3" /></svg>;
}
function PlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

// Stat Card 
function StatCard({
  label, value, sub, accent = false, delay = 0,
}: {
  label: string; value: string; sub?: string; accent?: boolean; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="border border-[#141414] rounded-2xl p-5 relative overflow-hidden group hover:border-[#1e1e1e] transition-colors"
      style={{ background: accent ? "linear-gradient(135deg, #0f1a00 0%, #0a0a0a 100%)" : "#0a0a0a" }}
    >
      {accent && (
        <div className="absolute top-0 right-0 w-24 h-24 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle at top right, #C8F135, transparent 70%)" }} />
      )}
      <p className="text-[10px] tracking-[0.2em] text-[#333] uppercase mb-3">{label}</p>
      <p
        className="font-extrabold text-2xl md:text-3xl mb-1 leading-none"
        style={{ fontFamily: "'Syne', sans-serif", color: accent ? "#C8F135" : "white" }}
      >
        {value}
      </p>
      {sub && <p className="text-[#333] text-xs">{sub}</p>}
    </motion.div>
  );
}

// Mini Bar Chart
function EarningsChart({ earnings }: { earnings: Earning[] }) {
  const monthly = MONTHS.map((month, mi) => {
    const total = earnings
      .filter((e) => new Date(e.earned_date).getMonth() === mi && new Date(e.earned_date).getFullYear() === new Date().getFullYear())
      .reduce((sum, e) => sum + e.amount_usd, 0);
    return { month, total };
  });

  const max = Math.max(...monthly.map((m) => m.total), 1);

  return (
    <div className="border border-[#141414] rounded-2xl p-6" style={{ background: "#0a0a0a" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[#333] uppercase mb-1">Monthly Earnings</p>
          <p className="text-white font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
            {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C8F135]" />
          <span className="text-[10px] text-[#333] tracking-widest uppercase">USD</span>
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-32">
        {monthly.map((m, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
            <motion.div
              className="w-full rounded-t-sm relative"
              style={{ background: m.total > 0 ? "#C8F135" : "#111", minHeight: 4 }}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max((m.total / max) * 100, 4)}%` }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {/* Tooltip */}
              {m.total > 0 && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-[#1a1a1a] border border-[#222] rounded px-2 py-1 whitespace-nowrap z-10">
                  <span className="text-[10px] text-white font-mono">${m.total.toLocaleString()}</span>
                </div>
              )}
            </motion.div>
            <span className="text-[8px] text-[#2a2a2a] tracking-wider">{m.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add Earning Modal
function AddEarningModal({ onClose, onAdd }: { onClose: () => void; onAdd: (e: Omit<Earning, "id">) => void }) {
  const [form, setForm] = useState({ source: "", amount_usd: "", earned_date: "", description: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.source || !form.amount_usd || !form.earned_date) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from("earnings").insert({
      user_id: user.id,
      source: form.source,
      amount_usd: parseFloat(form.amount_usd),
      currency: "USD",
      earned_date: form.earned_date,
      description: form.description,
    }).select().single();

    setLoading(false);
    if (!error && data) { onAdd(data); onClose(); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                e.target === e.currentTarget && onClose()
              }
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md border border-[#1e1e1e] rounded-2xl p-6"
        style={{ background: "#0c0c0c" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Add Earning</h2>
          <button onClick={onClose} className="text-[#444] hover:text-white transition-colors p-1">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Income Source</label>
            <input
              placeholder="e.g. Upwork, Fiverr, Direct Client"
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C8F135]/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Amount (USD)</label>
            <input
              type="number"
              placeholder="0.00"
              value={form.amount_usd}
              onChange={(e) => setForm((f) => ({ ...f, amount_usd: e.target.value }))}
              className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C8F135]/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Date Earned</label>
            <input
              type="date"
              value={form.earned_date}
              onChange={(e) => setForm((f) => ({ ...f, earned_date: e.target.value }))}
              className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C8F135]/40 transition-colors"
              style={{ colorScheme: "dark" }}
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Description (optional)</label>
            <input
              placeholder="e.g. Logo design for client"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C8F135]/40 transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#1a1a1a] text-[#555] text-sm hover:text-white hover:border-[#2a2a2a] transition-all">
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl bg-[#C8F135] text-black font-semibold text-sm hover:bg-[#d8ff40] transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Earning"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Sidebar
function Sidebar({
  profile, active, onSignOut, mobile, onClose,
}: {
  profile: Profile | null;
  active: string;
  onSignOut: () => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#080808", borderRight: "1px solid #111" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center justify-between border-b border-[#111]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#C8F135] flex items-center justify-center flex-shrink-0">
            <span className="text-black text-xs font-black">E</span>
          </div>
          <span className="text-white font-extrabold text-base" style={{ fontFamily: "'Syne', sans-serif" }}>EarnID</span>
        </Link>
        {mobile && onClose && (
          <button onClick={onClose} className="text-[#444] hover:text-white transition-colors p-1">
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.label;
          return (
            <Link key={item.label} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  background: isActive ? "#0f1a00" : "transparent",
                  color: isActive ? "#C8F135" : "#3a3a3a",
                  border: isActive ? "1px solid #1e2d00" : "1px solid transparent",
                }}
                onClick={mobile && onClose ? onClose : undefined}
              >
                <item.icon size={15} />
                <span className="text-sm font-medium tracking-wide">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1 h-1 rounded-full bg-[#C8F135]"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Profile + sign out */}
      <div className="px-3 py-4 border-t border-[#111] space-y-2">
        {/* Wallet connect */}
        <ConnectWalletButton />

        {/* Profile */}
        <div className="px-3 py-2.5 rounded-xl flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#0f1a00] border border-[#1e2d00] flex items-center justify-center flex-shrink-0">
            <span className="text-[#C8F135] text-[10px] font-bold">
              {profile?.full_name?.charAt(0) ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{profile?.full_name ?? "User"}</p>
            <p className="text-[#2a2a2a] text-[10px] truncate">{profile?.profession ?? ""}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={onSignOut}
          className="w-full px-3 py-2.5 rounded-xl text-[#2a2a2a] text-xs text-left hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          → Sign out
        </button>
      </div>
    </div>
  );
}

// Main Dashboard
export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

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

    const [{ data: profileData }, { data: earningsData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("earnings").select("*").eq("user_id", user.id).order("earned_date", { ascending: false }),
    ]);

    setProfile(profileData);
    setEarnings(earningsData ?? []);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Computed stats
  const totalEarned = earnings.reduce((s, e) => s + e.amount_usd, 0);
  const uniqueMonths = new Set(earnings.map((e) => e.earned_date.slice(0, 7))).size;
  const avgMonthly = uniqueMonths > 0 ? totalEarned / uniqueMonths : 0;
  const activeSince = earnings.length > 0
    ? new Date(Math.min(...earnings.map((e) => new Date(e.earned_date).getTime()))).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";
  const uniqueSources = new Set(earnings.map((e) => e.source)).size;

  // Consistency score
  const volumeScore = Math.min((totalEarned / 10000) * 100, 100);
  const regularityScore = Math.min((uniqueMonths / 12) * 100, 100);
  const diversityScore = Math.min(uniqueSources * 20, 100);
  const consistencyScore = Math.round(volumeScore * 0.4 + regularityScore * 0.4 + diversityScore * 0.2);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#111] border-t-[#C8F135] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-56 flex-shrink-0 fixed left-0 top-0 bottom-0">
        <Sidebar profile={profile} active="Overview" onSignOut={handleSignOut} />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 md:hidden"
              onClick={() => setMobileSidebar(false)}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 left-0 bottom-0 w-64 z-50 md:hidden"
            >
              <Sidebar profile={profile} active="Overview" onSignOut={handleSignOut} mobile onClose={() => setMobileSidebar(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-8 py-4 border-b border-[#111]"
          style={{ background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)" }}>

          {/* Mobile menu btn */}
          <button className="md:hidden text-[#444] hover:text-white transition-colors" onClick={() => setMobileSidebar(true)}>
            <MenuIcon />
          </button>

          {/* Page title */}
          <div className="hidden md:block">
            <h1 className="text-white font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
              Overview
            </h1>
            <p className="text-[#2a2a2a] text-xs">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Mobile title */}
          <h1 className="md:hidden text-white font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>Overview</h1>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#C8F135] text-black text-xs font-semibold hover:bg-[#d8ff40] transition-colors"
            >
              <PlusIcon size={13} />
              <span className="hidden sm:inline">Add Earning</span>
            </motion.button>
          </div>
        </div>

        {/* Page body */}
        <div className="flex-1 px-5 md:px-8 py-6 space-y-6">

          {/* Welcome strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-[#333] text-xs tracking-widest uppercase mb-0.5">Welcome back</p>
              <h2 className="text-white font-bold text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                {profile?.full_name?.split(" ")[0] ?? "Freelancer"} 👋
              </h2>
            </div>
            {consistencyScore > 0 && (
              <div className="text-right">
                <p className="text-[#333] text-[10px] tracking-widest uppercase">Consistency Score</p>
                <p className="text-[#C8F135] font-black text-2xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {consistencyScore}
                </p>
              </div>
            )}
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Earned" value={`$${totalEarned.toLocaleString()}`} sub="All time" accent delay={0} />
            <StatCard label="Monthly Avg" value={`$${Math.round(avgMonthly).toLocaleString()}`} sub="Per month" delay={0.08} />
            <StatCard label="Active Since" value={activeSince} sub="First earning" delay={0.16} />
            <StatCard label="Income Sources" value={`${uniqueSources}`} sub={`${earnings.length} entries`} delay={0.24} />
          </div>

          {/* Chart + Actions row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chart */}
            <div className="lg:col-span-2">
              <EarningsChart earnings={earnings} />
            </div>

            {/* Quick actions */}
            <div className="border border-[#141414] rounded-2xl p-5 space-y-3" style={{ background: "#0a0a0a" }}>
              <p className="text-[10px] tracking-[0.2em] text-[#333] uppercase mb-4">Quick Actions</p>

              {[
                { label: "Add Earning", sub: "Log new income", icon: "＋", action: () => setShowModal(true), accent: true },
                { label: "Mint Credential", sub: "Create on-chain proof", icon: "◈", action: () => router.push("/dashboard/credentials") },
                { label: "Share Proof", sub: "Generate verify link", icon: "◎", action: () => router.push("/dashboard/verify") },
                { label: "Upload CSV", sub: "Bulk import earnings", icon: "⬡", action: () => router.push("/dashboard/earnings") },
              ].map((action, i) => (
                <motion.button
                  key={i}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left"
                  style={{
                    borderColor: action.accent ? "#1e2d00" : "#111",
                    background: action.accent ? "#0a1200" : "transparent",
                  }}
                >
                  <span className="text-base" style={{ color: action.accent ? "#C8F135" : "#2a2a2a" }}>{action.icon}</span>
                  <div>
                    <p className="text-white text-xs font-medium">{action.label}</p>
                    <p className="text-[#2a2a2a] text-[10px]">{action.sub}</p>
                  </div>
                  <span className="ml-auto text-[#1a1a1a] text-xs">→</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Recent earnings */}
          <div className="border border-[#141414] rounded-2xl overflow-hidden" style={{ background: "#0a0a0a" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#111]">
              <p className="text-[10px] tracking-[0.2em] text-[#333] uppercase">Recent Earnings</p>
              <Link href="/dashboard/earnings">
                <span className="text-[10px] text-[#333] hover:text-[#C8F135] transition-colors tracking-widest uppercase cursor-pointer">
                  View all →
                </span>
              </Link>
            </div>

            {earnings.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[#1e1e1e] text-4xl mb-3">◈</p>
                <p className="text-[#2a2a2a] text-sm mb-1">No earnings yet</p>
                <p className="text-[#1a1a1a] text-xs">Add your first earning to get started</p>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowModal(true)}
                  className="mt-5 px-5 py-2.5 rounded-full bg-[#C8F135] text-black text-xs font-semibold hover:bg-[#d8ff40] transition-colors"
                >
                  + Add First Earning
                </motion.button>
              </div>
            ) : (
              <div className="divide-y divide-[#0d0d0d]">
                {earnings.slice(0, 8).map((earning, i) => (
                  <motion.div
                    key={earning.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-[#0d0d0d] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Source icon */}
                      <div className="w-8 h-8 rounded-lg bg-[#0d0d0d] border border-[#141414] flex items-center justify-center flex-shrink-0 group-hover:border-[#1e1e1e] transition-colors">
                        <span className="text-[#C8F135] text-[10px] font-bold">
                          {earning.source.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{earning.source}</p>
                        <p className="text-[#2a2a2a] text-[10px]">
                          {earning.description || new Date(earning.earned_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#C8F135] text-sm font-semibold" style={{ fontFamily: "'DM Mono', monospace" }}>
                        +${earning.amount_usd.toLocaleString()}
                      </p>
                      <p className="text-[#1e1e1e] text-[10px]">
                        {new Date(earning.earned_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Credential CTA */}
          {earnings.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="border border-[#1e2d00] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              style={{ background: "linear-gradient(135deg, #0a1200 0%, #080808 100%)" }}
            >
              <div>
                <p className="text-[#C8F135] text-xs tracking-widest uppercase mb-1">Ready to mint</p>
                <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                  You have enough data to mint your credential
                </h3>
                <p className="text-[#333] text-sm">Turn your {earnings.length} earnings into a tamper-proof on-chain proof.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(200,241,53,0.15)" }}
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push("/dashboard/credentials")}
                className="flex-shrink-0 px-6 py-3 rounded-full bg-[#C8F135] text-black text-sm font-semibold hover:bg-[#d8ff40] transition-all whitespace-nowrap"
              >
                Mint Now →
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Earning Modal */}
      <AnimatePresence>
        {showModal && (
          <AddEarningModal
            onClose={() => setShowModal(false)}
            onAdd={(newEarning) => setEarnings((prev) => [{ ...newEarning, id: Date.now().toString() }, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}