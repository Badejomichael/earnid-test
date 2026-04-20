"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";

const NAV_LINKS = ["Features", "How it works", "Verify"];

const STEPS = [
  {
    num: "01",
    title: "Connect your earnings",
    body: "Add income sources manually or via CSV — Upwork, Fiverr, direct clients, anything. Every dollar counts.",
  },
  {
    num: "02",
    title: "Generate your score",
    body: "Our algorithm analyses volume, consistency, and diversity to compute a single trust score institutions understand.",
  },
  {
    num: "03",
    title: "Mint on Solana",
    body: "Your credential is minted as a tamper-proof NFT. Immutable, permanent, and verifiable by anyone instantly.",
  },
  {
    num: "04",
    title: "Share your proof",
    body: "One link. One QR code. Visa officers, banks, and clients verify your income in seconds — no login required.",
  },
];

const PROBLEMS = [
  "Bank statements get rejected",
  "PDF payslips get forged",
  "Foreign clients don't trust you",
  "Visa applications keep failing",
  "Loans stay out of reach",
  "Your work history is invisible",
];

const FEATURES = [
  { title: "On-Chain Immutability", body: "Your credential is minted on Solana. No one can alter, forge, or revoke it — not even us.", tag: "Solana" },
  { title: "Consistency Score", body: "A proprietary algorithm turns earning patterns into a single number any institution immediately understands.", tag: "Algorithm" },
  { title: "Instant Public Verification", body: "Anyone verifies your income in seconds via a link or QR code. Zero login. Zero friction.", tag: "Verification" },
  { title: "Multi-source Aggregation", body: "Upwork, Fiverr, Toptal, Deel, direct clients — all your income unified into one trusted credential.", tag: "Aggregation" },
  { title: "Exportable Proof Card", body: "Download your credential as a PNG or PDF. Attach it to visa applications, loan forms, or contracts.", tag: "Export" },
  { title: "Business Verification API", body: "Banks and institutions query your credential programmatically. Real infrastructure for real trust.", tag: "API" },
];

function FloatingOrb({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y, width: size, height: size,
        background: "radial-gradient(circle, rgba(200,241,53,0.10) 0%, transparent 70%)",
        filter: "blur(50px)",
      }}
      animate={{ y: [0, -30, 0], opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 7 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#111" strokeWidth="8" />
        <motion.circle
          cx="70" cy="70" r={r} fill="none" stroke="#C8F135" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 2.5, delay: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-white text-4xl font-black leading-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {score}
        </motion.span>
        <span className="text-[#444] text-[10px] tracking-widest mt-0.5">SCORE</span>
      </div>
    </div>
  );
}

function CredentialCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full"
    >
      <div className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl"
        style={{ background: "linear-gradient(135deg, #C8F135, transparent)" }} />
      <div className="relative rounded-2xl p-6 border border-[#1f1f1f] overflow-hidden"
        style={{ background: "linear-gradient(160deg, #111 0%, #0a0a0a 100%)" }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#C8F135] flex items-center justify-center">
              <span className="text-black text-xs font-black">E</span>
            </div>
            <span className="text-xs tracking-[0.2em] text-[#444] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>EarnID</span>
          </div>
          <span className="text-[10px] tracking-[0.3em] text-[#C8F135] border border-[#C8F135]/20 px-2.5 py-1 rounded-full">VERIFIED</span>
        </div>
        <div className="mb-5">
          <p className="text-[10px] tracking-[0.2em] text-[#333] uppercase mb-1">Income Credential</p>
          <h3 className="text-white text-xl font-bold leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Chidera Obi</h3>
          <p className="text-[#444] text-xs mt-0.5">Full-Stack Developer · Lagos, NG</p>
        </div>
        <div className="flex items-center gap-6 mb-5">
          <ScoreRing score={91} />
          <div className="space-y-3 flex-1 min-w-0">
            <div>
              <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase">Total Verified</p>
              <p className="text-white font-bold text-2xl" style={{ fontFamily: "'Syne', sans-serif" }}>$38,200</p>
            </div>
            <div>
              <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase">Avg / Month</p>
              <p className="text-[#888] text-base font-medium">$3,183</p>
            </div>
            <div>
              <p className="text-[9px] tracking-[0.2em] text-[#333] uppercase">Active Since</p>
              <p className="text-[#888] text-sm">March 2021</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-5 flex-wrap">
          {["Upwork", "Toptal", "Direct", "Deel"].map((s) => (
            <span key={s} className="text-[9px] tracking-wider px-2.5 py-1 rounded-full border border-[#202020] text-[#444]">{s}</span>
          ))}
        </div>
        <div className="border-t border-[#161616] pt-4 flex items-center justify-between">
          <div>
            <p className="text-[8px] tracking-widest text-[#222] uppercase mb-0.5">On-chain proof</p>
            <p className="text-[10px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>SOL · 4xNp...7mKq</p>
          </div>
          <div className="w-10 h-10 bg-white rounded-md p-1 opacity-90">
            <svg viewBox="0 0 10 10" className="w-full h-full">
              {[[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[4,0],[4,1],[4,2],[5,1],[7,0],[8,0],[9,0],[7,1],[9,1],[7,2],[8,2],[9,2],[0,4],[1,4],[3,4],[5,4],[6,4],[8,4],[9,4],[0,5],[2,5],[4,5],[6,5],[8,5],[0,6],[2,6],[3,6],[5,6],[7,6],[9,6],[0,7],[1,7],[2,7],[4,7],[6,7],[8,7],[9,7],[0,8],[3,8],[5,8],[7,8],[0,9],[1,9],[2,9],[4,9],[5,9],[7,9],[9,9]].map(([cx, cy], i) => (
                <rect key={i} x={cx} y={cy} width="1" height="1" fill="black" />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProblemTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PROBLEMS.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="h-7 overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="text-[#C8F135] text-sm font-medium absolute"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          ✕ {PROBLEMS[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Ambient orbs */}
      <FloatingOrb x="5%" y="5%" size={500} delay={0} />
      <FloatingOrb x="65%" y="15%" size={350} delay={2} />
      <FloatingOrb x="35%" y="55%" size={450} delay={1} />

      {/* Scroll progress line */}
      <motion.div className="fixed left-0 top-0 w-0.5 bg-[#C8F135] z-50 origin-top" style={{ height: lineHeight }} />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-5 md:px-10 py-4 flex items-center justify-between"
        style={{ background: "rgba(8,8,8,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid #111" }}>

        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#C8F135] flex items-center justify-center">
            <span className="text-black text-sm font-black">E</span>
          </div>
          <span className="text-white font-extrabold tracking-tight text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>EarnID</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`}
              className="text-sm text-[#555] hover:text-white transition-colors duration-200 tracking-wide">{l}</a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <button className="text-sm text-[#555] hover:text-white transition-colors px-4 py-2">Sign in</button>
          </Link>
          <Link href="/register">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="text-sm font-semibold px-5 py-2.5 rounded-full bg-[#C8F135] text-black hover:bg-[#d8ff40] transition-colors">
              Get Started
            </motion.button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden flex flex-col gap-1.5 p-2 z-50 relative" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
          <motion.span animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} className="block w-6 h-0.5 bg-white origin-center" />
          <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} className="block w-6 h-0.5 bg-white" />
          <motion.span animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} className="block w-6 h-0.5 bg-white origin-center" />
        </button>
      </nav>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/60 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 bottom-0 w-72 z-40 flex flex-col md:hidden"
              style={{ background: "#0c0c0c", borderLeft: "1px solid #1a1a1a" }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#141414]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#C8F135] flex items-center justify-center">
                    <span className="text-black text-xs font-black">E</span>
                  </div>
                  <span className="text-white font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>EarnID</span>
                </div>
                <motion.button
                  onClick={() => setMenuOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full border border-[#222] flex items-center justify-center text-[#555] hover:border-[#333] hover:text-white transition-all"
                  aria-label="Close menu"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </motion.button>
              </div>

              <div className="flex flex-col px-6 py-8 gap-1 flex-1">
                {NAV_LINKS.map((l, i) => (
                  <motion.a
                    key={l}
                    href={`#${l.toLowerCase().replace(" ", "-")}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => setMenuOpen(false)}
                    className="text-base text-[#666] hover:text-white transition-colors py-4 border-b border-[#111] tracking-wide"
                  >{l}</motion.a>
                ))}
              </div>

              <div className="px-6 py-8 flex flex-col gap-3 border-t border-[#111]">
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  <button className="w-full py-3 rounded-full border border-[#222] text-[#666] text-sm hover:border-[#333] hover:text-white transition-all">Sign in</button>
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  <button className="w-full py-3 rounded-full bg-[#C8F135] text-black text-sm font-semibold hover:bg-[#d8ff40] transition-colors">Get Started</button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col lg:flex-row items-center gap-12 px-5 md:px-10 pt-28 pb-20 max-w-7xl mx-auto">
        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#1e1e1e] bg-[#0e0e0e] mb-8"
          >
            <motion.div className="w-2 h-2 rounded-full bg-[#C8F135]" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="text-[11px] tracking-[0.2em] text-[#555] uppercase">Powered by Solana · Raenest</span>
          </motion.div>

          <div className="mb-6">
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="leading-[1.0] font-extrabold tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
            >
              Prove your
              <br />
              <span className="relative inline-block" style={{ WebkitTextStroke: "1.5px #C8F135", color: "transparent" }}>
                income.
              </span>
              <br />
              <span className="text-white">Anywhere.</span>
            </motion.h1>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-6">
            <p className="text-[#333] text-xs tracking-widest uppercase mb-2">Nigerian freelancers face this daily</p>
            <ProblemTicker />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="text-[#444] text-base md:text-lg leading-relaxed max-w-lg mb-10 font-light"
          >
            EarnID turns your freelance earning history into a tamper-proof, on-chain credential.
            One link. Instant trust. No forgeries.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            <Link href="/register">
              <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 50px rgba(200,241,53,0.2)" }} whileTap={{ scale: 0.96 }}
                className="px-7 py-3.5 rounded-full bg-[#C8F135] text-black font-semibold text-sm tracking-wide hover:bg-[#d8ff40] transition-all">
                Mint Your Credential →
              </motion.button>
            </Link>
            <Link href="/verify/demo">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="px-7 py-3.5 rounded-full border border-[#1e1e1e] text-[#555] text-sm hover:border-[#2e2e2e] hover:text-white transition-all">
                See a sample credential
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="flex items-center gap-8 mt-10"
          >
            {[{ val: "100%", label: "On-chain" }, { val: "3s", label: "Verify time" }, { val: "0", label: "Forgeries possible" }].map((s) => (
              <div key={s.label}>
                <p className="text-white font-bold text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>{s.val}</p>
                <p className="text-[#2e2e2e] text-[10px] tracking-widest uppercase">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Credential card */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <CredentialCard />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="px-5 md:px-10 py-24 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <p className="text-[11px] tracking-[0.3em] text-[#C8F135] uppercase mb-4">Process</p>
          <h2 className="font-extrabold leading-tight" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Four steps to<span className="text-[#222]"> credibility.</span>
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-[39px] top-0 bottom-0 w-px bg-[#111] hidden md:block" />
          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="flex gap-6 group"
              >
                <div className="flex-shrink-0 w-20 flex items-start justify-center pt-5">
                  <div className="w-10 h-10 rounded-full border border-[#1a1a1a] flex items-center justify-center text-xs text-[#333] group-hover:border-[#C8F135] group-hover:text-[#C8F135] transition-all duration-300"
                    style={{ fontFamily: "'DM Mono', monospace" }}>
                    {step.num}
                  </div>
                </div>
                <div className="flex-1 border border-[#111] rounded-xl p-6 hover:border-[#1e1e1e] hover:bg-[#0a0a0a] transition-all duration-300 group-hover:translate-x-1">
                  <h3 className="text-white font-semibold text-lg mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{step.title}</h3>
                  <p className="text-[#444] text-sm leading-relaxed">{step.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-5 md:px-10 py-24 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <p className="text-[11px] tracking-[0.3em] text-[#C8F135] uppercase mb-4">Features</p>
          <h2 className="font-extrabold leading-tight" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Built for Africa's<span className="text-[#222]"> digital workforce.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="group p-6 border border-[#111] rounded-xl hover:border-[#1e1e1e] hover:bg-[#0a0a0a] transition-all duration-300 cursor-default"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] tracking-widest text-[#C8F135] border border-[#C8F135]/20 px-2.5 py-1 rounded-full">{f.tag}</span>
                <span className="text-[#1a1a1a] group-hover:text-[#C8F135] transition-colors text-xl">◈</span>
              </div>
              <h3 className="text-white font-semibold text-base mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{f.title}</h3>
              <p className="text-[#3a3a3a] text-sm leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-5 md:px-10 py-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden border border-[#1a1a1a] p-10 md:p-16 text-center"
          style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #0a0a0a 100%)" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle at top right, #C8F135, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 opacity-5 pointer-events-none"
            style={{ background: "radial-gradient(circle at bottom left, #C8F135, transparent 70%)" }} />
          <p className="text-[11px] tracking-[0.3em] text-[#C8F135] uppercase mb-5">Start today</p>
          <h2 className="font-extrabold leading-tight mb-5" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Your work is real.
            <br /><span className="text-[#222]">Now make it provable.</span>
          </h2>
          <p className="text-[#444] text-sm leading-relaxed max-w-md mx-auto mb-8">
            Join Africa's first on-chain income verification network. Free to start. Trusted forever.
          </p>
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 60px rgba(200,241,53,0.2)" }} whileTap={{ scale: 0.96 }}
              className="px-9 py-4 rounded-full bg-[#C8F135] text-black font-semibold text-sm tracking-wide hover:bg-[#d8ff40] transition-all"
            >
              Mint Your Credential — It's Free
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#0d0d0d] px-5 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#C8F135] flex items-center justify-center">
            <span className="text-black text-[10px] font-black">E</span>
          </div>
          <span className="font-bold text-sm text-[#2a2a2a]" style={{ fontFamily: "'Syne', sans-serif" }}>EarnID</span>
        </div>
        <p className="text-[#1e1e1e] text-[10px] tracking-[0.25em] uppercase text-center">
          Built on Solana · Powered by Raenest · Superteam Nigeria · Frontier {new Date().getFullYear()}
        </p>
        <p className="text-[#1e1e1e] text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>© {new Date().getFullYear()} EarnID</p>
      </footer>
    </div>
  );
}