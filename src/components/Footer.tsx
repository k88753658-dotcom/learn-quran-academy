"use client";
import React from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F5132] text-white font-sans">
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Top Row: Brand + Nav */}
        <div className="flex flex-col md:flex-row justify-between gap-10 pb-10 border-b border-white/10">
          
          {/* Brand */}
          <div className="max-w-xs">
            <h2 className="text-2xl font-black tracking-tight mb-2">
              Learn Quran <span className="text-[#D4AF37] font-serif italic font-normal">Academy</span>
            </h2>
            <p className="text-sm text-white/60 leading-relaxed font-medium">
              Authentic Quranic education, delivered globally by certified scholars.
            </p>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Navigate</span>
              <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors font-medium">Home</Link>
              <Link href="/courses" className="text-sm text-white/70 hover:text-white transition-colors font-medium">Courses</Link>
              <Link href="/register" className="text-sm text-white/70 hover:text-white transition-colors font-medium">Free Trial</Link>
              <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors font-medium">Student Portal</Link>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Connect</span>
              <a href="https://wa.me/923046263947" target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-white transition-colors font-medium">WhatsApp</a>
              <a href="mailto:learnquranacaademy.me@gmail.com" className="text-sm text-white/70 hover:text-white transition-colors font-medium">Email Us</a>
              <a href="https://www.instagram.com/learnquranacademy_/" target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-white transition-colors font-medium">Instagram</a>
              <a href="https://www.facebook.com/profile.php?id=61581303761340" target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-white transition-colors font-medium">Facebook</a>
            </div>
          </div>
        </div>

        {/* Bottom Row: Copyright + Legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-white/40 font-medium">
          <p>© {currentYear} Learn Quran Academy. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}