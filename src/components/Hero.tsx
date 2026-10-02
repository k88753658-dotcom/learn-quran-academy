"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-x-hidden px-6 min-h-screen flex items-center bg-[#F9F9F9]">
      
      {/* Subtle grid pattern overlay for that "tech platform" feel */}
      <div className="absolute inset-0 bg-[url('/islamic-pattern.png')] opacity-[0.03] bg-repeat pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* --- LEFT COLUMN: EMOTIONAL & PREMIUM COPY --- */}
        <div className="space-y-8">
          
          {/* Dynamic Platform Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#D4AF37]/30 bg-white/80 backdrop-blur-md shadow-[0_8px_20px_rgba(212,175,55,0.08)]">
            <div className="relative flex items-center justify-center w-5 h-5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-20"></span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-[#0F5132]">
              World-Class Quran Academy
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-[4.2rem] font-black tracking-tighter leading-[1.05] text-gray-900">
            Learn the Holy Quran with <br />
            <span className="relative inline-block mt-2 mb-1">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#C5A880] to-[#D4AF37] italic font-serif pr-2">Tajweed Excellence</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-[#D4AF37]/10 -z-10 rounded-full blur-[2px]"></span>
            </span> <br />
            <span className="text-[#0F5132] text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">Structured From Home.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 font-medium leading-relaxed max-w-xl">
            Connect your child directly with deeply experienced, verified instructors via our interactive live classroom terminal. Monitor their beautiful journey with real-time visual logs and official parent reports.
          </p>
          
          {/* Premium Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-5 pt-4">
            <Link href="/register" className="group relative w-full sm:w-auto p-[2px] rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#C5A880] to-[#D4AF37] opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3 bg-[#0F5132] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300">
                Apply Online
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </Link>
            
            <Link href="/login" className="w-full sm:w-auto px-10 py-[22px] rounded-2xl font-black uppercase tracking-widest text-sm text-[#0F5132] border-2 border-[#0F5132]/30 hover:border-[#0F5132] hover:bg-[#0F5132]/5 transition-all flex justify-center items-center">
              Portal Gateway
            </Link>
          </div>

          {/* Social Proof / Trust Details */}
          <div className="pt-10 flex flex-col sm:flex-row sm:items-center gap-6 border-t border-[#D4AF37]/20">
            <div className="flex -space-x-4">
              {[
                "https://i.pravatar.cc/100?img=12",
                "https://i.pravatar.cc/100?img=32",
                "https://i.pravatar.cc/100?img=45",
                "https://i.pravatar.cc/100?img=68"
              ].map((img, i) => (
                <div key={i} className="w-12 h-12 rounded-full border-[3px] border-white shadow-md overflow-hidden relative bg-white">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={img} alt="Trusted Parent" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} className="w-5 h-5 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#0F5132] mt-1">Trusted by 500+ Overseas Families</p>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: 3D QURAN ANIMATION --- */}
        <div className="relative hidden lg:flex justify-center items-center h-full w-full" style={{ perspective: '2500px' }}>
          <motion.div
            initial={{ rotateX: 25, rotateY: -30, rotateZ: 5 }}
            animate={{ 
              rotateX: [25, 20, 25], 
              rotateY: [-30, -35, -30]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-[340px] h-[480px]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Majestic Book Shadow */}
            <div className="absolute -bottom-16 left-0 w-[150%] h-20" 
                 style={{ 
                   transform: 'translateZ(-80px)',
                   background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, transparent 60%)'
                 }} 
            />

            {/* Back Cover */}
            <div className="absolute inset-0 rounded-r-3xl rounded-l-xl border border-[#0F5132]/50 shadow-xl" 
                 style={{ 
                   background: 'linear-gradient(45deg, #0F5132, #115E59, #0F5132)',
                   transform: 'translateZ(-25px)' 
                 }}>
              <div className="absolute inset-0 bg-[url('/islamic-pattern.png')] opacity-[0.05] bg-repeat rounded-r-3xl rounded-l-xl" />
              <div className="absolute right-0 top-0 bottom-0 w-2.5 rounded-r-3xl" style={{ background: 'linear-gradient(to bottom, #D4AF37, #fcf6ba, #C5A880, #fbf5b7, #D4AF37)' }} />
            </div>

            {/* Spine */}
            <div className="absolute left-0 top-0 bottom-0 w-14 rounded-l-xl shadow-inner border-l border-[#0F5132]/80" 
                 style={{ 
                   background: 'linear-gradient(to right, #0a3d24, #0F5132, #0a3d24)',
                   transform: 'translateX(-7px) translateZ(-12.5px) rotateY(-90deg)', 
                   transformOrigin: 'right',
                   transformStyle: 'preserve-3d'
                 }}>
               {[15, 30, 50, 70, 85].map(top => (
                 <div key={top} className="absolute left-0 right-0 h-2 shadow-md" 
                      style={{ top: `${top}%`, background: 'linear-gradient(to bottom, #115E59, #0a3d24)' }} />
               ))}
            </div>

            {/* Ribbon Bookmark (Tucked deep inside the book) */}
            <motion.div className="absolute top-0 left-6 w-5 h-64 shadow-md origin-top"
                 style={{ 
                   background: 'linear-gradient(to bottom, #D4AF37, #C5A880, #D4AF37)',
                   clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 90%, 0 100%)'
                 }}
                 animate={{ 
                   rotateZ: [0, -2, 0],
                   z: -10 
                 }}
                 transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Pages Block */}
            <div className="absolute inset-y-3 left-1 right-5 rounded-r-2xl shadow-[inset_-5px_0_15px_rgba(0,0,0,0.02)]" 
                 style={{ 
                   background: 'linear-gradient(to right, #f3f4f6, #ffffff)',
                   transform: 'translateZ(-12.5px)' 
                 }}>
              <div className="absolute inset-0 rounded-r-2xl opacity-40" 
                   style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 1px, rgba(212, 175, 55, 0.1) 1px, rgba(212, 175, 55, 0.1) 2px)' }} />
              <div className="absolute right-0 top-0 bottom-0 w-2.5 rounded-r-2xl shadow-sm" 
                   style={{ background: 'linear-gradient(to bottom, #D4AF37, #fcf6ba, #C5A880, #fbf5b7, #D4AF37)' }} />
            </div>

            {/* Animated Pages (Flipping open safely synced) */}
            {[1, 2, 3, 4, 5].map((page, i) => {
              const openTime = 0.05 + (i * 0.04);
              const closeTime = 0.95 - (i * 0.04);
              
              return (
                <motion.div
                  key={`page-${i}`}
                  className="absolute inset-y-3 left-1 right-5 rounded-r-2xl border-r border-[#e5e7eb] overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(to right, #f9f9f9, #ffffff)',
                    transformOrigin: 'left', 
                    transformStyle: 'preserve-3d',
                    boxShadow: '-4px 0 10px rgba(0,0,0,0.02)'
                  }}
                  animate={{ 
                    rotateY: [0, 0, -145 - (i * 4), -145 - (i * 4), 0, 0],
                    z: -2 - i 
                  }}
                  transition={{ 
                    duration: 12, 
                    repeat: Infinity, 
                    times: [0, openTime, 0.45, 0.55, closeTime, 1],
                    ease: "easeInOut"
                  }}
                >
                  <motion.div className="absolute inset-0 bg-linear-to-r from-black/5 to-transparent pointer-events-none" 
                       animate={{ opacity: [0, 0, 0.5, 0.5, 0, 0] }}
                       transition={{ duration: 12, repeat: Infinity, times: [0, openTime, 0.45, 0.55, closeTime, 1], ease: "easeInOut" }}
                       style={{ transform: 'translateZ(1px)' }}
                  />

                  {/* Page Content Layout */}
                  <div className="absolute inset-6 border-2 border-[#D4AF37]/20 rounded-xl p-2" style={{ transform: 'translateZ(0.5px)', backfaceVisibility: 'hidden' }}>
                    <div className="w-full h-full border border-[#D4AF37]/10 rounded-lg flex flex-col items-center p-8 relative overflow-hidden bg-white">
                       <div className="absolute inset-0 bg-[url('/islamic-pattern.png')] opacity-[0.02] bg-repeat" />
                       <div className="space-y-5 w-full flex flex-col items-end relative z-10 mt-4">
                         <div className="h-10 w-2/3 border border-[#D4AF37]/30 rounded-full mx-auto mb-6 flex items-center justify-center bg-[#D4AF37]/5">
                            <div className="h-2 w-1/3 bg-[#D4AF37]/30 rounded-full" />
                         </div>
                         <div className="h-2 w-full bg-[#0F5132]/10 rounded-full" />
                         <div className="h-2 w-[90%] bg-[#0F5132]/10 rounded-full" />
                         <div className="h-2 w-[95%] bg-[#0F5132]/10 rounded-full" />
                         <div className="h-2 w-[80%] bg-[#0F5132]/10 rounded-full" />
                         <div className="flex items-center gap-3 w-full justify-end mt-2">
                           <div className="w-4 h-4 rounded-full border border-[#D4AF37]/40 flex-shrink-0" />
                           <div className="h-2 w-[60%] bg-[#0F5132]/10 rounded-full" />
                         </div>
                         <div className="h-2 w-[85%] bg-[#0F5132]/10 rounded-full" />
                         <div className="h-2 w-full bg-[#0F5132]/10 rounded-full" />
                         <div className="flex items-center gap-3 w-full justify-end mt-2">
                           <div className="w-4 h-4 rounded-full border border-[#D4AF37]/40 flex-shrink-0" />
                           <div className="h-2 w-[40%] bg-[#0F5132]/10 rounded-full" />
                         </div>
                       </div>
                    </div>
                  </div>
                  
                  {/* Reverse side of the flipping page */}
                  <div className="absolute inset-0 rounded-l-2xl shadow-[inset_10px_0_15px_rgba(0,0,0,0.01)]" 
                       style={{ 
                         background: 'linear-gradient(to left, #f9f9f9, #ffffff)',
                         transform: 'rotateY(180deg) translateZ(1px)',
                         backfaceVisibility: 'hidden'
                       }}>
                       <div className="absolute inset-6 border border-[#D4AF37]/10 rounded-xl bg-white" />
                  </div>
                </motion.div>
              );
            })}

            {/* Front Cover */}
            <motion.div
              className="absolute inset-0 rounded-r-3xl rounded-l-xl overflow-hidden"
              style={{ 
                transformOrigin: 'left', 
                transformStyle: 'preserve-3d',
                boxShadow: '10px 5px 20px rgba(0,0,0,0.1)'
              }}
              animate={{ 
                rotateY: [0, 0, -165, -165, 0, 0],
                z: 1 
              }}
              transition={{ 
                duration: 12, 
                repeat: Infinity, 
                times: [0, 0.05, 0.45, 0.55, 0.95, 1],
                ease: "easeInOut" 
              }}
            >
              {/* === THE OUTER FRONT COVER (Hides when open) === */}
              <div className="absolute inset-0 flex items-center justify-center" 
                   style={{ 
                     background: 'linear-gradient(45deg, #0F5132, #115E59, #0F5132)',
                     backfaceVisibility: 'hidden' 
                   }}>
                <div className="absolute inset-0 bg-[url('/islamic-pattern.png')] opacity-[0.05] bg-repeat" />

                {/* Gold Ornamentation */}
                <div className="absolute inset-5 rounded-r-2xl flex items-center justify-center" 
                     style={{ 
                       border: '3px solid transparent',
                       borderImage: 'linear-gradient(135deg, #D4AF37, #fcf6ba, #C5A880, #fbf5b7, #D4AF37) 1',
                     }}>
                  <div className="absolute inset-3 rounded-r-xl" style={{ border: '1px solid rgba(212, 175, 55, 0.4)' }} />
                  
                  {/* Emblem */}
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <div className="absolute inset-0 rotate-45" 
                         style={{ 
                           border: '4px solid transparent',
                           borderImage: 'linear-gradient(135deg, #D4AF37, #fcf6ba, #C5A880) 1',
                           background: 'linear-gradient(135deg, rgba(212,175,55,0.1), transparent)'
                         }} />
                    <div className="absolute inset-3 rotate-45 border border-[#D4AF37]/40" />
                    <div className="relative z-10 flex flex-col items-center">
                      <span className="text-transparent bg-clip-text bg-linear-to-b from-[#fcf6ba] via-[#D4AF37] to-[#C5A880] text-5xl font-serif italic font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">القرآن</span>
                      <span className="text-[#D4AF37] text-sm tracking-[0.3em] uppercase mt-2 font-bold drop-shadow-sm">Al-Quran</span>
                    </div>
                  </div>
                  
                  {/* Corners */}
                  <div className="absolute top-4 left-4 w-10 h-10 border-t-[3px] border-l-[3px] border-[#D4AF37] rounded-tl-2xl" />
                  <div className="absolute top-4 right-4 w-10 h-10 border-t-[3px] border-r-[3px] border-[#D4AF37] rounded-tr-2xl" />
                  <div className="absolute bottom-4 left-4 w-10 h-10 border-b-[3px] border-l-[3px] border-[#D4AF37] rounded-bl-2xl" />
                  <div className="absolute bottom-4 right-4 w-10 h-10 border-b-[3px] border-r-[3px] border-[#D4AF37] rounded-br-2xl" />
                </div>
              </div>

              {/* === THE INSIDE OF THE COVER (Visible when open) === */}
              <div className="absolute inset-0 shadow-[inset_-5px_0_15px_rgba(0,0,0,0.02)] rounded-l-3xl rounded-r-xl" 
                   style={{ 
                     background: 'linear-gradient(to right, #f9f9f9, #ffffff)',
                     transform: 'rotateY(180deg) translateZ(1px)',
                     backfaceVisibility: 'hidden'
                   }}>
                  <div className="absolute inset-6 border border-[#D4AF37]/10 rounded-xl bg-white" />
                  <div className="absolute inset-0 bg-[url('/islamic-pattern.png')] opacity-[0.02] bg-repeat" />
              </div>
            </motion.div>
            
          </motion.div>
        </div>

      </div>
    </section>
  );
}