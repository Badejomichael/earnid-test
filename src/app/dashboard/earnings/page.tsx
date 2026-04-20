"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────
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
}

// ── Icons ──────────────────────────────────────────────────────────────────
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
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
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
function TrashIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <polyline points="2,4 14,4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M6 7v5M10 7v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function UploadIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2v9M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function SearchIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
      <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}


// ── Custom Dropdown ────────────────────────────────────────────────────────
function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-3 bg-[#0a0a0a] border border-[#141414] rounded-xl px-4 py-2.5 text-sm text-white min-w-[130px] hover:border-[#1e1e1e] transition-colors"
      >
        <span>{value}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="12" height="12" viewBox="0 0 12 12" fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="#444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 z-50 border border-[#1a1a1a] rounded-xl overflow-hidden"
            style={{ background: "#0e0e0e", minWidth: "130px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-[#141414]"
                style={{ color: value === opt ? "#C8F135" : "#555" }}
              >
                <span>{opt}</span>
                {value === opt && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <polyline points="2,6 5,9 10,3" stroke="#C8F135" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Nav items (same as dashboard) ──────────────────────────────────────────
const NAV_ITEMS = [
  { icon: GridIcon, label: "Overview", href: "/dashboard" },
  { icon: TrendingIcon, label: "Earnings", href: "/dashboard/earnings" },
  { icon: BadgeIcon, label: "Credentials", href: "/dashboard/credentials" },
  { icon: ShareIcon, label: "Verify", href: "/dashboard/verify" },
  { icon: SettingsIcon, label: "Settings", href: "/dashboard/settings" },
];

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({
  profile, active, onSignOut, mobile, onClose,
}: {
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
                {isActive && <motion.div layoutId="activeIndicator" className="ml-auto w-1 h-1 rounded-full bg-[#C8F135]" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-[#111] space-y-2">
        <div className="px-3 py-2.5 rounded-xl border border-[#111] flex items-center gap-2.5 cursor-pointer hover:border-[#1e1e1e] transition-colors">
          <div className="w-2 h-2 rounded-full bg-[#333]" />
          <span className="text-[#2a2a2a] text-xs tracking-wider">Connect Wallet</span>
        </div>
        <div className="px-3 py-2.5 rounded-xl flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#0f1a00] border border-[#1e2d00] flex items-center justify-center flex-shrink-0">
            <span className="text-[#C8F135] text-[10px] font-bold">{profile?.full_name?.charAt(0) ?? "U"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{profile?.full_name ?? "User"}</p>
            <p className="text-[#2a2a2a] text-[10px] truncate">{profile?.profession ?? ""}</p>
          </div>
        </div>
        <button onClick={onSignOut} className="w-full px-3 py-2.5 rounded-xl text-[#2a2a2a] text-xs text-left hover:text-red-400 hover:bg-red-500/5 transition-all">
          → Sign out
        </button>
      </div>
    </div>
  );
}

// ── Add Earning Modal ──────────────────────────────────────────────────────
function AddEarningModal({ onClose, onAdd }: { onClose: () => void; onAdd: (e: Earning) => void }) {
  const [form, setForm] = useState({ source: "", amount_usd: "", earned_date: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.source || !form.amount_usd || !form.earned_date) return setError("Please fill all required fields.");
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error: insertError } = await supabase.from("earnings").insert({
      user_id: user.id,
      source: form.source,
      amount_usd: parseFloat(form.amount_usd),
      currency: "USD",
      earned_date: form.earned_date,
      description: form.description,
    }).select().single();

    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    if (data) { onAdd(data); onClose(); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                    e.target === e.currentTarget && onClose()
                }
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md border border-[#1e1e1e] rounded-2xl p-6"
        style={{ background: "#0c0c0c" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Add Earning</h2>
          <button onClick={onClose} className="text-[#444] hover:text-white transition-colors p-1"><CloseIcon /></button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Income Source *</label>
            <input placeholder="e.g. Upwork, Fiverr, Direct Client"
              value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C8F135]/40 transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Amount (USD) *</label>
            <input type="number" min="0" step="0.01" placeholder="0.00"
              value={form.amount_usd} onChange={(e) => setForm((f) => ({ ...f, amount_usd: e.target.value }))}
              className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C8F135]/40 transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Date Earned *</label>
            <input type="date" value={form.earned_date} onChange={(e) => setForm((f) => ({ ...f, earned_date: e.target.value }))}
              className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C8F135]/40 transition-colors"
              style={{ colorScheme: "dark" }} />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Description (optional)</label>
            <input placeholder="e.g. Logo design for client"
              value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C8F135]/40 transition-colors" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#1a1a1a] text-[#555] text-sm hover:text-white hover:border-[#2a2a2a] transition-all">
              Cancel
            </button>
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl bg-[#C8F135] text-black font-semibold text-sm hover:bg-[#d8ff40] transition-all disabled:opacity-50">
              {loading ? "Saving..." : "Add Earning"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── CSV Upload Modal ───────────────────────────────────────────────────────
function CSVModal({ onClose, onImport }: { onClose: () => void; onImport: (rows: Earning[]) => void }) {
  const [parsed, setParsed] = useState<Omit<Earning, "id">[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.trim().split("\n");
      // Expect: source, amount_usd, earned_date, description (optional)
      const rows: Omit<Earning, "id">[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        if (cols.length < 3) continue;
        const amount = parseFloat(cols[1]);
        if (!cols[0] || isNaN(amount) || !cols[2]) continue;
        rows.push({ source: cols[0], amount_usd: amount, currency: "USD", earned_date: cols[2], description: cols[3] ?? "" });
      }
      if (rows.length === 0) return setError("No valid rows found. Check your CSV format.");
      setParsed(rows);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const toInsert = parsed.map((r) => ({ ...r, user_id: user.id }));
    const { data, error: insertError } = await supabase.from("earnings").insert(toInsert).select();

    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    onImport(data ?? []);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                e.target === e.currentTarget && onClose()
              }
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg border border-[#1e1e1e] rounded-2xl p-6"
        style={{ background: "#0c0c0c" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Import CSV</h2>
          <button onClick={onClose} className="text-[#444] hover:text-white transition-colors p-1"><CloseIcon /></button>
        </div>

        {/* Format guide */}
        <div className="mb-5 p-4 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a]">
          <p className="text-[10px] tracking-widest text-[#333] uppercase mb-2">Expected CSV Format</p>
          <p className="text-[#444] text-xs font-mono leading-relaxed">
            source, amount_usd, earned_date, description<br />
            Upwork, 1200, 2024-03-15, Logo design<br />
            Fiverr, 350, 2024-03-20, UI mockup
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">{error}</div>
        )}

        {/* Upload zone */}
        {parsed.length === 0 ? (
          <motion.div
            whileHover={{ borderColor: "#C8F135" }}
            onClick={() => fileRef.current?.click()}
            className="border border-dashed border-[#1e1e1e] rounded-xl p-10 text-center cursor-pointer transition-colors"
          >
            <div className="text-[#C8F135] mb-3 flex justify-center"><UploadIcon size={24} /></div>
            <p className="text-white text-sm font-medium mb-1">Click to upload CSV</p>
            <p className="text-[#333] text-xs">or drag and drop</p>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
          </motion.div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] tracking-widest text-[#C8F135] uppercase">{parsed.length} rows ready to import</p>
              <button onClick={() => setParsed([])} className="text-[#333] text-xs hover:text-white transition-colors">Clear</button>
            </div>
            <div className="border border-[#111] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              {parsed.slice(0, 10).map((row, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-[#0d0d0d] last:border-0">
                  <div>
                    <p className="text-white text-xs font-medium">{row.source}</p>
                    <p className="text-[#333] text-[10px]">{row.earned_date}</p>
                  </div>
                  <p className="text-[#C8F135] text-xs font-mono">${row.amount_usd.toLocaleString()}</p>
                </div>
              ))}
              {parsed.length > 10 && (
                <p className="text-[#333] text-[10px] text-center py-2">+{parsed.length - 10} more rows</p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#1a1a1a] text-[#555] text-sm hover:text-white hover:border-[#2a2a2a] transition-all">
            Cancel
          </button>
          {parsed.length > 0 && (
            <motion.button onClick={handleImport} disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-xl bg-[#C8F135] text-black font-semibold text-sm hover:bg-[#d8ff40] transition-all disabled:opacity-50">
              {loading ? "Importing..." : `Import ${parsed.length} Rows`}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Delete Confirm ─────────────────────────────────────────────────────────
function DeleteConfirm({ earning, onClose, onDelete }: { earning: Earning; onClose: () => void; onDelete: (id: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("earnings").delete().eq("id", earning.id);
    onDelete(earning.id);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                e.target === e.currentTarget && onClose()
              }
    >
      <motion.div
        initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-sm border border-[#1e1e1e] rounded-2xl p-6"
        style={{ background: "#0c0c0c" }}
      >
        <h2 className="text-white font-bold text-lg mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Delete Earning</h2>
        <p className="text-[#444] text-sm mb-6">
          Remove <span className="text-white font-medium">{earning.source}</span> — ${earning.amount_usd.toLocaleString()} from {new Date(earning.earned_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}? This can't be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#1a1a1a] text-[#555] text-sm hover:text-white hover:border-[#2a2a2a] transition-all">
            Cancel
          </button>
          <motion.button onClick={handleDelete} disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50">
            {loading ? "Deleting..." : "Delete"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function EarningsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Earning | null>(null);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [filterSource, setFilterSource] = useState("All");

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

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push("/"); };

  // Derived
  const sources = ["All", ...Array.from(new Set(earnings.map((e) => e.source)))];
  const filtered = earnings
    .filter((e) => filterSource === "All" || e.source === filterSource)
    .filter((e) => e.source.toLowerCase().includes(search.toLowerCase()) || e.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "date"
      ? new Date(b.earned_date).getTime() - new Date(a.earned_date).getTime()
      : b.amount_usd - a.amount_usd
    );

  const totalFiltered = filtered.reduce((s, e) => s + e.amount_usd, 0);

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
        <Sidebar profile={profile} active="Earnings" onSignOut={handleSignOut} />
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
              <Sidebar profile={profile} active="Earnings" onSignOut={handleSignOut} mobile onClose={() => setMobileSidebar(false)} />
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
              <h1 className="text-white font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Earnings</h1>
              <p className="text-[#2a2a2a] text-xs hidden md:block">{earnings.length} total entries</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setShowCSV(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#1a1a1a] text-[#555] text-xs hover:border-[#2a2a2a] hover:text-white transition-all">
              <UploadIcon size={13} />
              <span className="hidden sm:inline">Import CSV</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C8F135] text-black text-xs font-semibold hover:bg-[#d8ff40] transition-colors">
              <PlusIcon size={13} />
              <span className="hidden sm:inline">Add Earning</span>
            </motion.button>
          </div>
        </div>

        <div className="flex-1 px-5 md:px-8 py-6 space-y-5">

          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Earned", value: `$${earnings.reduce((s, e) => s + e.amount_usd, 0).toLocaleString()}` },
              { label: "Avg per Entry", value: `$${earnings.length > 0 ? Math.round(earnings.reduce((s, e) => s + e.amount_usd, 0) / earnings.length).toLocaleString() : 0}` },
              { label: "Total Entries", value: `${earnings.length}` },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="border border-[#141414] rounded-xl p-4" style={{ background: "#0a0a0a" }}>
                <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase mb-1">{s.label}</p>
                <p className="text-white font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#333]"><SearchIcon /></div>
              <input
                placeholder="Search by source or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#141414] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-[#2a2a2a] focus:outline-none focus:border-[#C8F135]/30 transition-colors"
              />
            </div>

            {/* Source filter */}
            <CustomSelect value={filterSource} onChange={setFilterSource} options={sources} />

            {/* Sort */}
            <div className="flex rounded-xl border border-[#141414] overflow-hidden">
              {(["date", "amount"] as const).map((s) => (
                <button key={s} onClick={() => setSortBy(s)}
                  className="px-4 py-2.5 text-xs transition-all capitalize"
                  style={{
                    background: sortBy === s ? "#0f1a00" : "#0a0a0a",
                    color: sortBy === s ? "#C8F135" : "#333",
                  }}>
                  {s === "date" ? "Latest" : "Highest"}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          {search || filterSource !== "All" ? (
            <p className="text-[#333] text-xs">
              Showing <span className="text-white">{filtered.length}</span> results
              {" "}· Total: <span className="text-[#C8F135]">${totalFiltered.toLocaleString()}</span>
            </p>
          ) : null}

          {/* Earnings list */}
          {filtered.length === 0 ? (
            <div className="border border-[#111] rounded-2xl py-20 text-center" style={{ background: "#0a0a0a" }}>
              <p className="text-[#1e1e1e] text-4xl mb-3">◈</p>
              <p className="text-[#2a2a2a] text-sm mb-1">
                {earnings.length === 0 ? "No earnings yet" : "No results match your filters"}
              </p>
              {earnings.length === 0 && (
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => setShowAdd(true)}
                  className="mt-5 px-5 py-2.5 rounded-full bg-[#C8F135] text-black text-xs font-semibold hover:bg-[#d8ff40] transition-colors">
                  + Add First Earning
                </motion.button>
              )}
            </div>
          ) : (
            <div className="border border-[#141414] rounded-2xl overflow-hidden" style={{ background: "#0a0a0a" }}>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 px-5 py-3 border-b border-[#0d0d0d]"
                style={{ gridTemplateColumns: "3fr 2fr 2fr 2fr 1fr" }}>
                {["Source", "Description", "Amount", "Date", ""].map((h, i) => (
                  <p key={i} className="text-[9px] tracking-[0.2em] text-[#222] uppercase">{h}</p>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-[#0d0d0d]">
                <AnimatePresence>
                  {filtered.map((earning, i) => (
                    <motion.div
                      key={earning.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex md:grid items-center gap-4 px-5 py-4 hover:bg-[#0d0d0d] transition-colors group"
                      style={{ gridTemplateColumns: "3fr 2fr 2fr 2fr 1fr" }}
                    >
                      {/* Source */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#0d0d0d] border border-[#141414] flex items-center justify-center flex-shrink-0 group-hover:border-[#1e1e1e] transition-colors">
                          <span className="text-[#C8F135] text-[10px] font-bold">{earning.source.charAt(0).toUpperCase()}</span>
                        </div>
                        <p className="text-white text-sm font-medium truncate">{earning.source}</p>
                      </div>

                      {/* Description */}
                      <p className="text-[#333] text-xs truncate hidden md:block">{earning.description || "—"}</p>

                      {/* Amount */}
                      <p className="text-[#C8F135] text-sm font-semibold ml-auto md:ml-0"
                        style={{ fontFamily: "'DM Mono', monospace" }}>
                        +${earning.amount_usd.toLocaleString()}
                      </p>

                      {/* Date */}
                      <p className="text-[#2a2a2a] text-xs hidden md:block">
                        {new Date(earning.earned_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>

                      {/* Delete */}
                      <div className="flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setDeleteTarget(earning)}
                          className="opacity-0 group-hover:opacity-100 text-[#222] hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-500/5"
                        >
                          <TrashIcon />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAdd && <AddEarningModal onClose={() => setShowAdd(false)} onAdd={(e) => setEarnings((prev) => [e, ...prev])} />}
        {showCSV && <CSVModal onClose={() => setShowCSV(false)} onImport={(rows) => setEarnings((prev) => [...rows, ...prev])} />}
        {deleteTarget && <DeleteConfirm earning={deleteTarget} onClose={() => setDeleteTarget(null)} onDelete={(id) => setEarnings((prev) => prev.filter((e) => e.id !== id))} />}
      </AnimatePresence>
    </div>
  );
}