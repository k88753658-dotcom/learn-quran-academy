"use client";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirectUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe,
        fetchOptions: {
          onSuccess: () => {
            // Do nothing here — we handle redirect below
          },
        },
      });

      if (error) {
        setErrorMessage(error.message || "Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      // Fetch the full session to reliably get the user's role
      let targetUrl = callbackUrl;
      try {
        const sessionRes = await fetch("/api/auth/get-session", { credentials: "include" });
        const sessionData = await sessionRes.json();
        const role = sessionData?.user?.role;
        if (targetUrl === "/dashboard") {
          if (role === "admin") targetUrl = "/admin/dashboard";
          else if (role === "teacher") targetUrl = "/teacher-dashboard";
        }
      } catch {
        // If session fetch fails, fall through to default callbackUrl
      }

      router.push(targetUrl);
      router.refresh();
    } catch (err: any) {
      console.error("Sign in exception:", err);
      setErrorMessage(err.message || "An unexpected error occurred during sign in.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex font-sans selection:bg-[#0F5132] selection:text-white">
      {/* ===== LEFT PANEL: BRANDING ===== */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0F5132] relative flex-col justify-between p-16 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.5) 35px, rgba(255,255,255,0.5) 36px)`,
        }} />
        
        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-white/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-serif italic text-xl tracking-tight">
              LQ
            </div>
            <span className="text-white/80 text-sm font-light tracking-[0.2em] uppercase group-hover:text-white transition-colors">Learn Quran Academy</span>
          </Link>
        </div>

        {/* Center: Big serif quote */}
        <div className="relative z-10 space-y-8">
          <div className="text-[#D4AF37]/40 font-serif text-8xl leading-none">"</div>
          <h2 className="text-4xl xl:text-5xl font-serif text-white leading-[1.2] tracking-tight -mt-8">
            Whoever teaches <br />something, gets the <br />
            <span className="text-[#D4AF37] italic">reward of the learner.</span>
          </h2>
          <div className="flex items-center gap-4 mt-8">
            <div className="w-12 h-[1px] bg-[#D4AF37]/50" />
            <p className="text-white/50 text-sm font-light tracking-widest uppercase">Prophet Muhammad ﷺ</p>
          </div>
        </div>

        {/* Bottom: Stats */}
        <div className="relative z-10 flex gap-12">
          <div>
            <p className="text-3xl font-serif text-[#D4AF37]">500+</p>
            <p className="text-white/40 text-xs font-light tracking-widest uppercase mt-1">Students</p>
          </div>
          <div>
            <p className="text-3xl font-serif text-[#D4AF37]">15+</p>
            <p className="text-white/40 text-xs font-light tracking-widest uppercase mt-1">Countries</p>
          </div>
          <div>
            <p className="text-3xl font-serif text-[#D4AF37]">4.9★</p>
            <p className="text-white/40 text-xs font-light tracking-widest uppercase mt-1">Rating</p>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL: CUSTOM LOGIN FORM ===== */}
      <div className="w-full lg:w-[55%] bg-[#F9F9F9] flex flex-col items-center justify-center px-6 py-16 relative">
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F5132] flex items-center justify-center text-[#D4AF37] font-serif italic text-lg">
              LQ
            </div>
            <span className="text-gray-900 text-sm font-light tracking-[0.2em] uppercase">Learn Quran Academy</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md flex flex-col items-center"
        >
          {/* Card Container */}
          <div className="w-full bg-white shadow-xl border border-gray-100 rounded-2xl p-8 md:p-10 relative">
            <div className="mb-8 text-center">
              <h1 className="font-serif text-3xl text-[#0F5132] font-normal mb-2">Sign In</h1>
              <p className="text-gray-500 font-light text-sm">Welcome back to your Quranic education portal</p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="font-light">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] outline-none text-sm text-gray-900 transition-colors bg-white font-light placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-gray-600">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-lg border border-gray-200 focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] outline-none text-sm text-gray-900 transition-colors bg-white font-light placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-[#0F5132] focus:ring-[#0F5132]"
                  />
                  <span className="font-light">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0F5132] hover:bg-[#D4AF37] hover:text-[#0F5132] text-white font-bold py-3.5 px-6 rounded-lg transition-all duration-200 text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs font-light text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-bold text-[#0F5132] hover:text-[#D4AF37] transition-colors">
                Enroll Now
              </Link>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link href="/" className="text-xs font-light text-gray-400 hover:text-[#0F5132] transition-colors tracking-widest uppercase">
              ← Back to Homepage
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#0F5132]" /></div>}>
      <LoginForm />
    </Suspense>
  );
}