"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PROFESSIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "UI/UX Designer",
  "Product Manager",
  "Content Creator",
  "Graphic Designer",
  "Data Analyst",
  "DevOps Engineer",
  "Other",
];

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [professionOpen, setProfessionOpen] = useState(false);
  const [customProfession, setCustomProfession] = useState("");
  const professionRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    profession: "",
  });

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (professionRef.current && !professionRef.current.contains(e.target as Node)) {
        setProfessionOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleProfessionSelect = (p: string) => {
    setForm((f) => ({ ...f, profession: p }));
    if (p !== "Other") setCustomProfession("");
    setProfessionOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError("");
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleStepOne = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return setError("Please enter your full name.");
    if (!form.email.trim()) return setError("Please enter your email.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.profession) return setError("Please select your profession.");
    setLoading(true);
    setError("");

    // Step 1: Sign up
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, profession: form.profession },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Step 2: Immediately sign in (works when email confirm is disabled)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      // Account created but couldn't auto-login — send to login page
      router.push("/login?registered=true");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div
      className="min-h-screen bg-[#080808] text-white flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] border-r border-[#111] p-12 relative overflow-hidden">
        {/* Orb */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(200,241,53,0.08) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 rounded-full bg-[#C8F135] flex items-center justify-center">
            <span className="text-black text-sm font-black">E</span>
          </div>
          <span className="text-white font-extrabold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>EarnID</span>
        </Link>

        {/* Center content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[11px] tracking-[0.3em] text-[#C8F135] uppercase mb-6">Why EarnID?</p>
            <h2
              className="font-extrabold leading-tight mb-8 text-4xl"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Stop being
              <br />
              <span style={{ WebkitTextStroke: "1.5px #C8F135", color: "transparent" }}>invisible.</span>
            </h2>

            <div className="space-y-5">
              {[
                { icon: "◈", text: "Tamper-proof income credentials minted on Solana" },
                { icon: "◎", text: "One link verifies your income — no login required" },
                { icon: "⬡", text: "Trusted by visa officers, banks, and global clients" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex items-start gap-4"
                >
                  <span className="text-[#C8F135] text-lg mt-0.5 flex-shrink-0">{item.icon}</span>
                  <p className="text-[#444] text-sm leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sample credential mini card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 border border-[#1a1a1a] rounded-xl p-5"
          style={{ background: "#0d0d0d" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[9px] tracking-widest text-[#333] uppercase">Income Credential</p>
              <p className="text-white font-semibold text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>Adaeze Okonkwo</p>
            </div>
            <span className="text-[9px] tracking-widest text-[#C8F135] border border-[#C8F135]/20 px-2 py-0.5 rounded-full">VERIFIED</span>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[8px] tracking-widest text-[#333] uppercase">Total Earned</p>
              <p className="text-white font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>$24,800</p>
            </div>
            <div>
              <p className="text-[8px] tracking-widest text-[#333] uppercase">Score</p>
              <p className="text-[#C8F135] font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>87</p>
            </div>
            <div>
              <p className="text-[8px] tracking-widest text-[#333] uppercase">Since</p>
              <p className="text-[#666] text-sm">Jan 2022</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 md:px-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 self-start">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#C8F135] flex items-center justify-center">
              <span className="text-black text-sm font-black">E</span>
            </div>
            <span className="text-white font-extrabold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>EarnID</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <motion.div
                  animate={{
                    background: step >= s ? "#C8F135" : "#111",
                    borderColor: step >= s ? "#C8F135" : "#222",
                  }}
                  className="w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-mono transition-colors"
                  style={{ color: step >= s ? "#000" : "#444", fontFamily: "'DM Mono', monospace" }}
                >
                  {step > s ? "✓" : s}
                </motion.div>
                {s < 2 && (
                  <motion.div
                    animate={{ background: step > s ? "#C8F135" : "#1a1a1a" }}
                    className="w-12 h-px transition-colors"
                  />
                )}
              </div>
            ))}
            <span className="text-[#333] text-xs ml-2" style={{ fontFamily: "'DM Mono', monospace" }}>
              Step {step} of 2
            </span>
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <h1
                className="font-extrabold text-3xl md:text-4xl mb-2"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {step === 1 ? "Create your account" : "One last thing"}
              </h1>
              <p className="text-[#444] text-sm mb-8">
                {step === 1
                  ? "Start building your verifiable income identity."
                  : "Tell us about your work so we can tailor your credential."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1 form */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleStepOne}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Full Name</label>
                  <input
                    name="fullName"
                    type="text"
                    placeholder="Chidera Obi"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3.5 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C8F135]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3.5 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C8F135]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Password</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3.5 pr-12 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C8F135]/40 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#C8F135] transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {/* Password strength */}
                  {form.password.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map((level) => (
                        <motion.div
                          key={level}
                          animate={{
                            background: form.password.length >= level * 3
                              ? level <= 2 ? "#ef4444" : level === 3 ? "#f59e0b" : "#C8F135"
                              : "#1a1a1a"
                          }}
                          className="h-1 flex-1 rounded-full transition-colors"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(200,241,53,0.15)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl bg-[#C8F135] text-black font-semibold text-sm tracking-wide hover:bg-[#d8ff40] transition-all mt-2"
                >
                  Continue →
                </motion.button>
              </motion.form>
            )}

            {/* Step 2 form */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Your Profession</label>
                  <div ref={professionRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setProfessionOpen((o) => !o)}
                      className="w-full flex items-center justify-between gap-3 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3.5 text-sm text-left hover:border-[#C8F135]/40 transition-colors"
                      style={{ color: form.profession ? "white" : "#333" }}
                    >
                      <span>{form.profession || "Select your profession"}</span>
                      <motion.svg
                        animate={{ rotate: professionOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0"
                      >
                        <path d="M2 4l4 4 4-4" stroke="#444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </motion.svg>
                    </button>

                    <AnimatePresence>
                      {professionOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full mt-2 left-0 right-0 z-50 border border-[#1a1a1a] rounded-xl overflow-hidden"
                          style={{ background: "#0e0e0e", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", maxHeight: "220px", overflowY: "auto" }}
                        >
                          {PROFESSIONS.map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => handleProfessionSelect(p)}
                              className="w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors hover:bg-[#141414]"
                              style={{ color: form.profession === p ? "#C8F135" : "#555" }}
                            >
                              <span>{p}</span>
                              {form.profession === p && (
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

                  {/* Custom profession input when "Other" is selected */}
                  <AnimatePresence>
                    {form.profession === "Other" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <input
                          type="text"
                          placeholder="Type your profession..."
                          value={customProfession}
                          onChange={(e) => setCustomProfession(e.target.value)}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              setForm((f) => ({ ...f, profession: e.target.value.trim() }));
                            }
                          }}
                          className="w-full bg-[#0d0d0d] border border-[#C8F135]/30 rounded-xl px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C8F135]/60 transition-colors"
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Summary */}
                <div className="border border-[#111] rounded-xl p-4 space-y-2">
                  <p className="text-[9px] tracking-widest text-[#333] uppercase mb-3">Account Summary</p>
                  <div className="flex justify-between">
                    <span className="text-[#444] text-xs">Name</span>
                    <span className="text-white text-xs font-medium">{form.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#444] text-xs">Email</span>
                    <span className="text-white text-xs font-medium">{form.email}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(1)}
                    className="px-5 py-4 rounded-xl border border-[#1a1a1a] text-[#555] text-sm hover:border-[#2a2a2a] hover:text-white transition-all"
                  >
                    ← Back
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(200,241,53,0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-4 rounded-xl bg-[#C8F135] text-black font-semibold text-sm tracking-wide hover:bg-[#d8ff40] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="block w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                        />
                        Creating account...
                      </span>
                    ) : "Create Account →"}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Sign in link */}
          <p className="text-[#333] text-sm text-center mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-[#C8F135] hover:underline">Sign in</Link>
          </p>

          <p className="text-[#1e1e1e] text-[10px] text-center mt-6 tracking-widest uppercase">
            Built on Solana · Superteam Nigeria
          </p>
        </div>
      </div>
    </div>
  );
}