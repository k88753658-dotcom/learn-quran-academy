"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { academyBlogs } from "@/lib/blogData";
import ScrollReveal from "@/components/ScrollReveal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// --- 3D INTERACTIVE CARD COMPONENT ---
const Blog3DCard = ({ post, index }: { post: any; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Motion values for tracking mouse position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs to make the 3D tilt feel natural and organic
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map mouse position to 3D rotation angles
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
      style={{ perspective: 1200 }} // Gives depth to the 3D effect
      className="relative z-10"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="group bg-white/80 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(92,64,51,0.1)] border border-white hover:shadow-[0_20px_50px_-20px_rgba(212,175,55,0.3)] transition-all flex flex-col h-full cursor-pointer relative"
      >
        {/* Abstract 3D Floating Element Inside Card */}
        <motion.div 
          style={{ translateZ: 50 }} 
          className="absolute -top-6 -right-6 w-24 h-24 bg-linear-to-br from-[#D4AF37]/20 to-[#50C878]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"
        />

        <motion.div style={{ translateZ: 30 }} className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[#D4AF37] font-black text-xs tracking-widest uppercase bg-[#D4AF37]/10 px-4 py-1.5 rounded-full border border-[#D4AF37]/20">
              {post.category || "Reflection"}
            </span>
            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
              {post.date}
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-black text-[#5C4033] mb-4 leading-snug group-hover:text-[#50C878] transition-colors">
            {post.title}
          </h2>
          
          <p className="text-gray-500 font-medium leading-relaxed mb-8 flex-1">
            {post.excerpt}
          </p>
          
          <Link href={`/blog/${post.id}`} className="mt-auto inline-flex">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#5C4033] group-hover:text-[#D4AF37] transition-all">
              <span className="relative">
                Read Our Story
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] group-hover:w-full transition-all duration-300" />
              </span>
              <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FDFCF0] text-[#5C4033] relative overflow-hidden pb-32">
        
        {/* --- DYNAMIC PARALLAX BACKGROUND PARTICLES --- */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              y: [0, -20, 0], 
              rotate: [0, 5, -5, 0],
              opacity: [0.3, 0.6, 0.3] 
            }} 
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-125 h-125 bg-[#D4AF37]/5 rounded-full blur-25" 
          />
          <motion.div 
            animate={{ 
              y: [0, 30, 0], 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.5, 0.2] 
            }} 
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/2 right-0 w-150 h-150 bg-[#50C878]/5 rounded-full blur-30" 
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 pt-40">
          
          {/* --- EMOTIONAL HERO SECTION --- */}
          <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
            <ScrollReveal>
              <span className="inline-block relative">
                <span className="relative z-10 text-white font-black text-[10px] uppercase tracking-widest bg-[#5C4033] px-5 py-2 rounded-full shadow-lg">
                  From Our Family to Yours
                </span>
                <span className="absolute inset-0 bg-[#5C4033] rounded-full blur animate-pulse" />
              </span>
            </ScrollReveal>

            <ScrollReveal>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-[#5C4033]">
                Stories From <span className="text-transparent bg-clip-text bg-linear-to-r from-[#D4AF37] to-[#50C878]">The Heart</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal>
              <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
                A warm, welcoming space where we share beautiful journeys of faith, gentle parenting tips, and heartfelt reflections to nurture your child's bond with the Holy Quran.
              </p>
            </ScrollReveal>
          </div>

          {/* --- 3D INTERACTIVE GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-12 relative z-20">
            {academyBlogs.map((post: any, index: number) => (
              <Blog3DCard key={post.id} post={post} index={index} />
            ))}
          </div>

          {/* --- WARM CLOSING / NEWSLETTER TIE-IN --- */}
          <div className="mt-32 max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="bg-[#5C4033] rounded-[3rem] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl border-4 border-white/10">
                <div className="absolute inset-0 bg-[url('/islamic-pattern.png')] opacity-5 bg-repeat mix-blend-overlay" />
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }} 
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,#D4AF37_0%,transparent_60%)] opacity-20 pointer-events-none"
                />
                
                <h3 className="text-3xl md:text-5xl font-black tracking-tight mb-4 relative z-10">Let's Walk This Path Together</h3>
                <p className="text-[#D2B48C] font-medium text-sm md:text-lg max-w-xl mx-auto mb-10 relative z-10 leading-relaxed">
                  Join our extended academy family. Receive gentle reminders, free Tajweed guides, and inspiring stories directly to your inbox.
                </p>
                
                <form className="max-w-md mx-auto relative z-10 flex flex-col sm:flex-row gap-3 shadow-2xl" onSubmit={(e) => { e.preventDefault(); alert("Welcome to the family!"); }}>
                  <input 
                    type="email" 
                    placeholder="Where should we send the letters?" 
                    required
                    className="flex-1 px-6 py-5 rounded-2xl text-sm font-medium text-[#5C4033] outline-none border-2 border-transparent focus:border-[#D4AF37] transition-all bg-white/95"
                  />
                  <button type="submit" className="bg-linear-to-r from-[#D4AF37] to-[#C5A028] hover:from-[#C5A028] hover:to-[#B48F17] text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl whitespace-nowrap active:scale-95">
                    Join Family
                  </button>
                </form>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}