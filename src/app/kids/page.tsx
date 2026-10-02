"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function KidsPage() {
  const features = [
    {
      title: "Interactive Whiteboards",
      desc: "No boring lectures! Our teachers use digital drawing, coloring, and interactive slides to teach Arabic letters.",
      icon: "🎨",
      color: "bg-[#7A9D8C]"
    },
    {
      title: "Gamified Learning",
      desc: "Kids earn digital stars, badges, and certificates as they progress, keeping them highly motivated to attend.",
      icon: "⭐",
      color: "bg-[#C5A880]"
    },
    {
      title: "Short Attention Spans?",
      desc: "We adapt. Our 30-minute sessions are fast-paced, switching between reading, reciting, and storytelling to avoid burnout.",
      icon: "⏱️",
      color: "bg-[#4A3C31]"
    },
    {
      title: "Loving & Patient Tutors",
      desc: "Our child-specialist tutors are trained to be gentle, encouraging, and smiling, making the Quran a source of joy, not stress.",
      icon: "🤗",
      color: "bg-[#50C878]"
    }
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF7F2] text-[#4A3C31] pt-32 pb-24 relative overflow-hidden font-sans">
        
        {/* Playful Ambient Backgrounds */}
        <div className="absolute top-[-10%] right-[-5%] w-150 h-150 bg-[#50C878]/10 blur-25 rounded-full z-0 pointer-events-none" />
        <div className="absolute top-[40%] left-[-10%] w-120 h-120 bg-[#C5A880]/15 blur-25 rounded-full z-0 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[10%] w-150 h-150 bg-[#7A9D8C]/15 blur-30 rounded-full z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* --- HERO SECTION --- */}
          <section className="text-center mb-24 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-[#C5A880]/30 px-6 py-3 rounded-full shadow-md mb-8"
            >
              <span className="text-xl">🎈</span>
              <span className="text-xs font-black uppercase tracking-widest text-[#4A3C31]">
                Specially designed for ages 4 to 12
              </span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[#4A3C31] mb-6 leading-tight">
                Making the Quran a <br/>
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#50C878] to-[#7A9D8C]">
                  joyful journey.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto">
                We replace strict, intimidating classrooms with warmth, patience, and interactive fun, helping your child build a lifelong love for Islam.
              </p>
            </motion.div>
          </section>

          {/* --- HOW WE TEACH KIDS --- */}
          <div className="grid md:grid-cols-2 gap-8 mb-32 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, rotate: index % 2 === 0 ? 1 : -1 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#C5A880]/20 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg text-white`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-[#4A3C31] mb-3">{feature.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* --- PARENT REVIEW HIGHLIGHT --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-[#4A3C31] rounded-[3rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden mb-32"
          >
            <div className="absolute inset-0 bg-[url('/islamic-pattern.png')] opacity-5 bg-repeat mix-blend-overlay" />
            <div className="text-5xl mb-6 relative z-10">🌟🌟🌟🌟🌟</div>
            <h2 className="text-2xl md:text-4xl font-black text-white mb-8 relative z-10 leading-snug">
              "My 6-year-old son used to run away from his local Madrasa classes. Now, he logs onto his iPad 10 minutes early waiting for his teacher. The difference is unbelievable."
            </h2>
            <p className="text-[#C5A880] font-black uppercase tracking-widest text-sm relative z-10">
              — Sarah M. (Mother of two, UK)
            </p>
          </motion.div>

          {/* --- FUN CTA SECTION --- */}
          <section className="max-w-3xl mx-auto text-center bg-white border border-[#C5A880]/30 rounded-[3rem] p-12 shadow-xl relative overflow-hidden">
             {/* Decorative circles */}
             <div className="absolute top-5 left-5 w-32 h-32 bg-[#50C878]/10 rounded-full blur-xl" />
             <div className="absolute bottom-5 right-5 w-40 h-40 bg-[#C5A880]/10 rounded-full blur-xl" />
             
             <h2 className="text-3xl font-black text-[#4A3C31] mb-4 relative z-10">Let's try a fun evaluation class!</h2>
             <p className="text-gray-500 mb-8 relative z-10 font-medium text-sm">
               Sign up for a free 3-day trial. You sit right next to them and watch how we make learning the Arabic alphabet feel like a game.
             </p>
             <Link href="/register" className="inline-block relative z-10 bg-[#7A9D8C] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_10px_20px_-10px_rgba(122,157,140,0.8)] hover:bg-[#50C878] hover:-translate-y-1 transition-all">
               Book Free Kids Trial
             </Link>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}