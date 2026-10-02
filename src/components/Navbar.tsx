"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Menu, X, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSignedIn = !!session?.user;
  const user = session?.user;
  const role = (user as any)?.role || (typeof window !== "undefined" ? localStorage.getItem("user_role") : null) || "student";

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "LQ";

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Courses", path: "/courses" },
    { name: "Pricing", path: "/pricing" },
    { name: "Teach With Us", path: "/teach" },
    { name: "Contact", path: "/contact" },
  ];

  const handleDashboardRedirect = () => {
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else if (role === "teacher") {
      router.push("/teacher/dashboard");
    } else {
      router.push("/dashboard");
    }
    setIsOpen(false);
    setUserDropdownOpen(false);
  };

  const handleSignOut = async () => {
    try {
      localStorage.clear();
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch (e) {
      console.error("Sign out error:", e);
    }
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* --- TOP ANNOUNCEMENT BAR --- */}
      <div className="bg-[#0F5132] text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase py-2 px-6 flex justify-center items-center gap-4 relative z-50">
        <span className="hidden sm:inline">Admissions Open for Global Students</span>
        <span className="sm:hidden">Admissions Open</span>
        <div className="w-1 h-1 bg-[#D4AF37] rounded-full" />
        <Link href="/register" className="text-[#D4AF37] hover:text-white transition-colors flex items-center gap-1">
          Apply Now <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* --- MAIN NAVBAR --- */}
      <header 
        className={`fixed top-[32px] sm:top-[34px] left-0 right-0 z-40 transition-all duration-500 border-b ${
          isScrolled 
            ? "bg-white/90 backdrop-blur-xl border-gray-100 shadow-sm py-4" 
            : "bg-gradient-to-b from-white/80 to-transparent border-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* LOGO */}
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 group relative z-50">
            <div className="w-10 h-10 border border-[#D4AF37]/40 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#C5A880] shadow-sm flex items-center justify-center overflow-hidden">
               <div className="w-[34px] h-[34px] rounded-md bg-[#0F5132] flex items-center justify-center">
                  <span className="text-white font-serif italic font-black text-xl leading-none pt-1">Q</span>
               </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-[#0F5132] uppercase leading-none">
                Learn<span className="text-[#D4AF37] italic font-serif lowercase text-[1.2em]">Quran</span>
              </span>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-500 mt-0.5">Global Academy</span>
            </div>
          </Link>

          {/* DESKTOP LINKS (CENTERED) */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`group relative text-xs font-bold uppercase tracking-widest py-2 transition-colors duration-300 ${
                    isActive ? "text-[#0F5132]" : "text-gray-600 hover:text-[#0F5132]"
                  }`}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37] transform origin-left transition-transform duration-300 ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                </Link>
              );
            })}
          </nav>

          {/* DESKTOP ACTIONS (RIGHT) */}
          <div className="hidden md:flex items-center gap-5 relative z-50">
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDashboardRedirect}
                  className="text-[11px] font-bold uppercase tracking-widest text-[#0F5132] hover:text-[#D4AF37] transition-colors"
                >
                  Dashboard
                </button>

                {/* User avatar pill & dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-[#D4AF37]/50 bg-white hover:border-[#D4AF37] transition-all shadow-sm"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0F5132] text-[#D4AF37] flex items-center justify-center font-serif text-xs font-bold">
                      {initials}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-[11px] font-bold text-gray-900 leading-tight max-w-[100px] truncate">{user?.name || "Student"}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] leading-tight">{role}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs font-bold text-gray-900 truncate">{user?.name || "Account"}</p>
                          <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-[#0F5132]/10 text-[#0F5132] text-[9px] font-black uppercase tracking-wider rounded">
                            {role}
                          </span>
                        </div>
                        <button
                          onClick={handleDashboardRedirect}
                          className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 font-medium flex items-center justify-between"
                        >
                          Dashboard
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 border-t border-gray-100"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={handleSignOut}
                  className="text-[11px] font-bold uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors ml-1"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-[#0F5132] transition-colors">
                  Login
                </Link>
                <Link href="/register" className="group relative overflow-hidden bg-[#D4AF37] text-[#0F5132] text-[11px] font-black uppercase tracking-widest px-7 py-3 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <span className="relative z-10 text-[#0F5132]">Enroll Now</span>
                  <ChevronRight className="w-4 h-4 text-[#0F5132] group-hover:translate-x-1 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative z-50 p-2 text-gray-900 hover:text-[#0F5132] transition-colors"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* MOBILE FULLSCREEN OVERLAY */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-gray-100 shadow-xl h-screen flex flex-col"
            >
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link, i) => {
                    const isActive = pathname === link.path;
                    return (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link
                          href={link.path}
                          onClick={() => setIsOpen(false)}
                          className={`block text-2xl font-black tracking-tight py-2 border-b border-gray-100 ${
                            isActive ? "text-[#0F5132]" : "text-gray-900"
                          }`}
                        >
                          {link.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-8 flex flex-col gap-4"
                >
                  {isSignedIn ? (
                    <>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-[#0F5132] text-[#D4AF37] flex items-center justify-center font-serif text-sm font-bold shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.name || "Student"}</p>
                          <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-[#0F5132]/10 text-[#0F5132] text-[9px] font-black uppercase tracking-wider rounded">
                            {role}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleDashboardRedirect}
                        className="w-full bg-[#0F5132] text-white text-sm font-black uppercase tracking-widest py-4 rounded-xl shadow-sm flex justify-center items-center gap-2"
                      >
                        Go to Dashboard <ChevronRight className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full bg-red-50 text-red-600 text-sm font-black uppercase tracking-widest py-3 rounded-xl border border-red-200 hover:bg-red-100 flex justify-center items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setIsOpen(false); router.push("/register"); }}
                        className="w-full bg-[#D4AF37] text-[#0F5132] text-sm font-black uppercase tracking-widest py-4 rounded-xl shadow-sm flex justify-center items-center gap-2"
                      >
                        Enroll Now <ChevronRight className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => { setIsOpen(false); router.push("/login"); }}
                        className="w-full bg-transparent text-[#0F5132] text-sm font-black uppercase tracking-widest py-4 rounded-xl border-2 border-[#0F5132]/30 hover:bg-[#0F5132]/5"
                      >
                        Student Login
                      </button>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}