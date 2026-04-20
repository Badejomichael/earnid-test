"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Show success message if redirected from register
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "true") {
      setSuccess("Account created! Please sign in with your credentials.");
    }
  }, []);
  const [showForgot, setShowForgot] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError("Please fill in all fields.");
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return setError("Please enter your email.");
    setLoading(true);
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (resetError) return setError(resetError.message);
    setSuccess("Reset link sent! Check your inbox.");
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
          style={{ background: "radial-gradient(circle, rgba(200,241,53,0.07) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 rounded-full bg-[#C8F135] flex items-center justify-center">
            <span className="text-black text-sm font-black">E</span>
          </div>
          <span className="text-white font-extrabold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>EarnID</span>
        </Link>

        {/* Quote */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[11px] tracking-[0.3em] text-[#C8F135] uppercase mb-6">Welcome back</p>
            <h2
              className="font-extrabold leading-tight mb-6 text-4xl"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Your income
              <br />
              <span style={{ WebkitTextStroke: "1.5px #C8F135", color: "transparent" }}>speaks</span>
              <br />
              for itself.
            </h2>
            <p className="text-[#333] text-sm leading-relaxed max-w-xs">
              Access your verifiable income credentials and share your proof of earnings with anyone, anywhere.
            </p>
          </motion.div>
        </div>

        {/* Stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 grid grid-cols-3 gap-px border border-[#111] rounded-xl overflow-hidden"
        >
          {[
            { val: "100%", label: "On-chain" },
            { val: "3s", label: "Verify time" },
            { val: "∞", label: "Shareable" },
          ].map((s, i) => (
            <div key={i} className="bg-[#0d0d0d] p-4 text-center">
              <p className="text-white font-bold text-xl mb-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>{s.val}</p>
              <p className="text-[#333] text-[9px] tracking-widest uppercase">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right panel (form) */}
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
          <AnimatePresence mode="wait">

            {/* Login form */}
            {!showForgot && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1
                  className="font-extrabold text-3xl md:text-4xl mb-2"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Sign in
                </h1>
                <p className="text-[#444] text-sm mb-8">Welcome back. Your credentials are waiting.</p>

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

                <form onSubmit={handleLogin} className="space-y-4">
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
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase">Password</label>
                      <button
                        type="button"
                        onClick={() => { setShowForgot(true); setError(""); }}
                        className="text-[10px] tracking-wider text-[#333] hover:text-[#C8F135] transition-colors uppercase"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Your password"
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
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(200,241,53,0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl bg-[#C8F135] text-black font-semibold text-sm tracking-wide hover:bg-[#d8ff40] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="block w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                        />
                        Signing in...
                      </span>
                    ) : "Sign In →"}
                  </motion.button>
                </form>

                <p className="text-[#333] text-sm text-center mt-8">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-[#C8F135] hover:underline">Create one</Link>
                </p>
              </motion.div>
            )}

            {/* Forgot password */}
            {showForgot && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1
                  className="font-extrabold text-3xl md:text-4xl mb-2"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Reset password
                </h1>
                <p className="text-[#444] text-sm mb-8">
                  Enter your email and we'll send you a reset link.
                </p>

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
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-5 px-4 py-3 rounded-xl border border-[#C8F135]/20 bg-[#C8F135]/5 text-[#C8F135] text-sm"
                    >
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] text-[#444] uppercase mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => { setForgotEmail(e.target.value); setError(""); }}
                      className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3.5 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#C8F135]/40 transition-colors"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(200,241,53,0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl bg-[#C8F135] text-black font-semibold text-sm tracking-wide hover:bg-[#d8ff40] transition-all disabled:opacity-50 mt-2"
                  >
                    {loading ? "Sending..." : "Send Reset Link →"}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => { setShowForgot(false); setError(""); setSuccess(""); }}
                    className="w-full py-3 text-[#444] text-sm hover:text-white transition-colors"
                  >
                    ← Back to sign in
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-[#1e1e1e] text-[10px] text-center mt-10 tracking-widest uppercase">
            Built on Solana · Superteam Nigeria
          </p>
        </div>
      </div>
    </div>
  );
}