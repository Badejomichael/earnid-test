"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useWallet } from "@solana/wallet-adapter-react";
import ConnectWalletButton from "@/components/ConnectWalletButton";

interface Profile {
  full_name: string;
  profession: string;
  wallet_address: string | null;
  country: string;
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
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19.4 13a7.9 7.9 0 0 0 .05-2l2.05-1.6a.5.5 0 0 0 .12-.64l-1.94-3.36a.5.5 0 0 0-.6-.22l-2.42.97a7.7 7.7 0 0 0-1.73-1l-.37-2.57A.5.5 0 0 0 14.07 2h-4.14a.5.5 0 0 0-.49.42L9.07 5a7.7 7.7 0 0 0-1.73 1l-2.42-.97a.5.5 0 0 0-.6.22L2.38 8.61a.5.5 0 0 0 .12.64L4.55 10.85a7.9 7.9 0 0 0 0 2.3L2.5 14.75a.5.5 0 0 0-.12.64l1.94 3.36a.5.5 0 0 0 .6.22l2.42-.97a7.7 7.7 0 0 0 1.73 1l.37 2.57a.5.5 0 0 0 .49.42h4.14a.5.5 0 0 0 .49-.42l.37-2.57a7.7 7.7 0 0 0 1.73-1l2.42.97a.5.5 0 0 0 .6-.22l1.94-3.36a.5.5 0 0 0-.12-.64L19.4 13Z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function MenuIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}
function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}
function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="2,7 5,10 12,3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

const NAV_ITEMS = [
  { icon: GridIcon,    label: "Overview",    href: "/dashboard" },
  { icon: TrendingIcon,label: "Earnings",    href: "/dashboard/earnings" },
  { icon: BadgeIcon,   label: "Credentials", href: "/dashboard/credentials" },
  { icon: ShareIcon,   label: "Verify",      href: "/dashboard/verify" },
  { icon: SettingsIcon,label: "Settings",    href: "/dashboard/settings" },
];

const PROFESSIONS = [
  "Frontend Developer","Backend Developer","Full-Stack Developer",
  "UI/UX Designer","Product Manager","Content Creator",
  "Graphic Designer","Data Analyst","DevOps Engineer","Other",
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
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

// ─── Custom Profession Select ─────────────────────────────────────────────────
function CustomProfessionSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  // showInput: true only while the user is actively typing a custom profession
  const [showInput, setShowInput] = useState(false);
  const [customVal, setCustomVal] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const isCustomValue = value && !PROFESSIONS.includes(value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCommit = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed) onChange(trimmed);
    setShowInput(false); // hide input after committing
    setCustomVal("");
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm text-left hover:border-[#C8F135]/40 transition-colors"
        style={{ color: value ? "white" : "#2a2a2a" }}>
        <span className="truncate">{isCustomValue ? value : (value || "Select profession")}</span>
        <motion.svg animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
          width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
          <path d="M2 4l4 4 4-4" stroke="#444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 z-50 border border-[#1a1a1a] rounded-xl overflow-hidden"
            style={{ background: "#0e0e0e", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", maxHeight: "220px", overflowY: "auto" }}>
            {PROFESSIONS.map((p) => (
              <button key={p} type="button"
                onClick={() => {
                  if (p === "Other") {
                    setShowInput(true); // show text input only when Other is clicked
                    setCustomVal("");
                  } else {
                    onChange(p);
                    setShowInput(false);
                    setCustomVal("");
                  }
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors hover:bg-[#141414]"
                style={{ color: (isCustomValue ? "Other" : value) === p ? "#C8F135" : "#555" }}>
                <span>{p}</span>
                {(isCustomValue ? "Other" : value) === p && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <polyline points="2,6 5,9 10,3" stroke="#C8F135" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom input — only visible while actively typing, disappears on blur */}
      <AnimatePresence>
        {showInput && (
          <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 10 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <input
              type="text"
              placeholder="Type your profession..."
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              onBlur={(e) => handleCommit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCommit(customVal);
                }
                if (e.key === "Escape") {
                  setShowInput(false);
                  setCustomVal("");
                }
              }}
              className="w-full bg-[#0d0d0d] border border-[#C8F135]/30 rounded-xl px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C8F135]/60 transition-colors"
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, name, value, onChange, placeholder, type = "text", mono = false }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; mono?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#2a2a2a] focus:outline-none focus:border-[#C8F135]/40 transition-colors"
        style={mono ? { fontFamily: "'DM Mono', monospace" } : {}}
      />
    </div>
  );
}

// ─── Wallet address field — same styling as Field, auto-populated ────────────
function WalletField({ value, onChange }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">
        Solana Wallet Address (Optional)
      </label>
      <input
        name="wallet_address"
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Enter your Solana wallet address"
        spellCheck={false}
        autoComplete="off"
        className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#2a2a2a] focus:outline-none focus:border-[#C8F135]/40 transition-colors"
        style={{ fontFamily: "'DM Mono', monospace" }}
      />
    </div>
  );
}


// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-5 py-3 rounded-full border text-sm"
      style={{
        zIndex: 99997,
        background: type === "success" ? "#0a1200" : "#1a0000",
        borderColor: type === "success" ? "#1e2d00" : "#2d0000",
        color: type === "success" ? "#C8F135" : "#ef4444",
        whiteSpace: "nowrap",
      }}
    >
      {type === "success" ? <CheckIcon /> : <span>✕</span>}
      {message}
    </motion.div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ onClose, onConfirm, loading }: {
  onClose: () => void; onConfirm: () => void; loading: boolean;
}) {
  const [typed, setTyped] = useState("");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99998, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md border border-[#2a1010] rounded-2xl p-6" style={{ background: "#0c0a0a" }}>
        <h2 className="text-white font-bold text-lg mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          Delete account
        </h2>
        <p className="text-[#444] text-sm mb-5 leading-relaxed">
          This permanently deletes your account, all your earnings data, and your credential. This cannot be undone.
        </p>
        <div className="mb-5">
          <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">
            Type <span className="text-red-400">DELETE</span> to confirm
          </label>
          <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="DELETE"
            className="w-full bg-[#0d0d0d] border border-[#2a1010] rounded-xl px-4 py-3 text-white text-sm placeholder-[#2a2a2a] focus:outline-none focus:border-red-500/30 transition-colors" />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#1a1a1a] text-[#555] text-sm hover:text-white transition-all">
            Cancel
          </button>
          <motion.button whileHover={{ scale: typed === "DELETE" ? 1.02 : 1 }}
            whileTap={{ scale: typed === "DELETE" ? 0.98 : 1 }}
            onClick={onConfirm} disabled={typed !== "DELETE" || loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: typed === "DELETE" ? "#ef4444" : "#1a0000", color: typed === "DELETE" ? "white" : "#444" }}>
            {loading ? "Deleting..." : "Delete Account"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { publicKey, connected } = useWallet();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    profession: "",
    wallet_address: "",
    country: "Nigeria",
  });
  const [passwordForm, setPasswordForm] = useState({ newPass: "", confirm: "" });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Track whether the wallet field has been manually edited by the user
  // so we don't override their edits when the component re-renders
  const walletManuallyEdited = useRef(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    loadData();
  }, []);

  // Auto-populate wallet field from connected wallet adapter
  // but only if the user hasn't manually edited the field
  useEffect(() => {
    if (connected && publicKey && !walletManuallyEdited.current) {
      setForm((f) => ({ ...f, wallet_address: publicKey.toBase58() }));
    }
  }, [connected, publicKey]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setEmail(user.email ?? "");

    const { data: profileData } = await supabase
      .from("profiles").select("*").eq("id", user.id).single();

    if (profileData) {
      setProfile(profileData);
      setForm({
        full_name:      profileData.full_name      ?? "",
        profession:     profileData.profession     ?? "",
        wallet_address: profileData.wallet_address ?? "",
        country:        profileData.country        ?? "Nigeria",
      });
    }
    setLoading(false);
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push("/"); };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) return showToast("Name is required", "error");
    setSavingProfile(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").update({
      full_name:      form.full_name,
      profession:     form.profession,
      wallet_address: form.wallet_address.trim() || null,
      country:        form.country,
    }).eq("id", user.id);

    setSavingProfile(false);
    if (error) { showToast("Failed to save profile", "error"); return; }
    setProfile((p) => p ? { ...p, ...form } : p);
    walletManuallyEdited.current = false; // reset after save
    showToast("Profile updated successfully", "success");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.newPass) return showToast("Enter a new password", "error");
    if (passwordForm.newPass.length < 8) return showToast("Password must be at least 8 characters", "error");
    if (passwordForm.newPass !== passwordForm.confirm) return showToast("Passwords don't match", "error");
    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPass });
    setSavingPassword(false);
    if (error) { showToast(error.message, "error"); return; }
    setPasswordForm({ newPass: "", confirm: "" });
    showToast("Password changed successfully", "success");
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await fetch("/api/delete-account", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { showToast(data?.error ?? "Failed to delete account", "error"); setDeletingAccount(false); return; }
      await supabase.auth.signOut({ scope: "global" });
      if (typeof window !== "undefined") { localStorage.clear(); sessionStorage.clear(); }
      router.push("/");
    } catch {
      showToast("Something went wrong. Please try again.", "error");
      setDeletingAccount(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Mark wallet field as manually edited so live wallet doesn't override it
    if (name === "wallet_address") {
      walletManuallyEdited.current = true;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

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
        <Sidebar profile={profile} active="Settings" onSignOut={handleSignOut} />
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
              <Sidebar profile={profile} active="Settings" onSignOut={handleSignOut} mobile onClose={() => setMobileSidebar(false)} />
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
              <h1 className="text-white font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Settings</h1>
              <p className="text-[#2a2a2a] text-xs hidden md:block">Manage your account</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-5 md:px-8 py-6 max-w-2xl mx-auto w-full space-y-5">

          {/* Profile section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="border border-[#141414] rounded-2xl overflow-hidden" style={{ background: "#0a0a0a" }}>
            <div className="px-6 py-5 border-b border-[#0d0d0d]">
              <p className="text-[10px] tracking-[0.2em] text-[#333] uppercase mb-0.5">Profile</p>
              <p className="text-white font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>Personal information</p>
            </div>

            <form onSubmit={handleSaveProfile} className="px-6 py-5 space-y-4">
              {/* Avatar row */}
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-full bg-[#0f1a00] border border-[#1e2d00] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#C8F135] text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {form.full_name?.charAt(0)?.toUpperCase() ?? "U"}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{form.full_name || "Your Name"}</p>
                  <p className="text-[#333] text-xs">{email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" name="full_name" value={form.full_name}
                  onChange={handleChange} placeholder="Chidera Obi" />
                <div>
                  <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Profession</label>
                  <CustomProfessionSelect value={form.profession}
                    onChange={(val) => setForm((f) => ({ ...f, profession: val }))} />
                </div>
              </div>

              <Field label="Country" name="country" value={form.country}
                onChange={handleChange} placeholder="Nigeria" />

              {/* ── Editable wallet field ── */}
              <WalletField value={form.wallet_address} onChange={handleChange} />

              {/* Email read-only */}
              <div>
                <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Email Address</label>
                <div className="flex items-center gap-2 bg-[#0d0d0d] border border-[#111] rounded-xl px-4 py-3">
                  <p className="flex-1 text-[#333] text-sm truncate" style={{ fontFamily: "'DM Mono', monospace" }}>{email}</p>
                  <span className="text-[9px] tracking-widest text-[#222] border border-[#1a1a1a] px-2 py-0.5 rounded-full">Read only</span>
                </div>
              </div>

              <motion.button type="submit" disabled={savingProfile}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-[#C8F135] text-black font-semibold text-sm hover:bg-[#d8ff40] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {savingProfile ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="block w-4 h-4 border-2 border-black/30 border-t-black rounded-full" />
                    Saving...
                  </span>
                ) : "Save Profile"}
              </motion.button>
            </form>
          </motion.div>

          {/* Password section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="border border-[#141414] rounded-2xl overflow-hidden" style={{ background: "#0a0a0a" }}>
            <div className="px-6 py-5 border-b border-[#0d0d0d]">
              <p className="text-[10px] tracking-[0.2em] text-[#333] uppercase mb-0.5">Security</p>
              <p className="text-white font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>Change password</p>
            </div>

            <form onSubmit={handleChangePassword} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">New Password</label>
                <div className="relative">
                  <input type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPass}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, newPass: e.target.value }))}
                    placeholder="Min. 8 characters"
                    className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 pr-12 text-white text-sm placeholder-[#2a2a2a] focus:outline-none focus:border-[#C8F135]/40 transition-colors" />
                  <button type="button" onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#C8F135] transition-colors">
                    {showNewPassword
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
                {passwordForm.newPass.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4].map((level) => (
                      <motion.div key={level}
                        animate={{ background: passwordForm.newPass.length >= level * 3 ? level <= 2 ? "#ef4444" : level === 3 ? "#f59e0b" : "#C8F135" : "#1a1a1a" }}
                        className="h-1 flex-1 rounded-full" />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Confirm New Password</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                    placeholder="Repeat new password"
                    className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 pr-12 text-white text-sm placeholder-[#2a2a2a] focus:outline-none focus:border-[#C8F135]/40 transition-colors"
                    style={{ borderColor: passwordForm.confirm && passwordForm.confirm !== passwordForm.newPass ? "rgba(239,68,68,0.4)" : undefined }} />
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#C8F135] transition-colors">
                    {showConfirmPassword
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
                {passwordForm.confirm && passwordForm.confirm !== passwordForm.newPass && (
                  <p className="text-red-400 text-xs mt-1.5">Passwords don't match</p>
                )}
              </div>

              <motion.button type="submit" disabled={savingPassword}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl border border-[#1a1a1a] text-white text-sm font-medium hover:border-[#C8F135]/30 hover:bg-[#0f1a00] transition-all disabled:opacity-50">
                {savingPassword ? "Updating..." : "Update Password"}
              </motion.button>
            </form>
          </motion.div>

          {/* Danger zone */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            className="border border-[#1a0808] rounded-2xl overflow-hidden" style={{ background: "#0a0808" }}>
            <div className="px-6 py-5 border-b border-[#1a0808]">
              <p className="text-[10px] tracking-[0.2em] text-red-900 uppercase mb-0.5">Danger Zone</p>
              <p className="text-white font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>Delete account</p>
            </div>
            <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-[#444] text-sm leading-relaxed">
                Permanently delete your account, all earnings, and your credential. This cannot be undone.
              </p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteModal(true)}
                className="flex-shrink-0 px-5 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-medium hover:bg-red-500/10 hover:border-red-500/30 transition-all">
                Delete Account
              </motion.button>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Delete modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteAccount} loading={deletingAccount} />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}