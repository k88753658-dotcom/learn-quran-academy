"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { GraduationCap, Globe, Lightbulb, Star, ArrowRight } from "lucide-react";

export default function AboutPage() {
  const pillars = [
    {
      icon: GraduationCap,
      title: "Verified Scholarship",
      desc: "Every instructor undergoes a rigorous 4-stage vetting process, holding authentic Ijazahs tracing back through generations."
    },
    {
      icon: Globe,
      title: "Global Standards",
      desc: "Our curriculum is meticulously structured to meet international educational standards, ensuring seamless integration for students worldwide."
    },
    {
      icon: Lightbulb,
      title: "Modern Pedagogy",
      desc: "We blend traditional Islamic sciences with state-of-the-art interactive digital tools to keep modern minds engaged and focused."
    },
  ];

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-[#F9F9F9] text-gray-900 pt-32 pb-0 font-sans overflow-x-hidden selection:bg-[#0F5132] selection:text-white">
        
        {/* --- PREMIUM AMBIENT GLOWS --- */}
        <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] bg-[#0F5132]/5 blur-[120px] rounded-full z-0 pointer-events-none" />
        <div className="absolute top-[40%] right-[-10%] w-[800px] h-[800px] bg-[#D4AF37]/10 blur-[120px] rounded-full z-0 pointer-events-none" />
        
        {/* --- HERO SECTION --- */}
        <section className="relative z-10 max-w-5xl mx-auto px-6 text-center mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 justify-center mb-8">
              <span className="w-10 h-[2px] bg-[#D4AF37]" />
              <span className="text-[#0F5132] text-xs font-black uppercase tracking-[0.3em]">Our Heritage</span>
              <span className="w-10 h-[2px] bg-[#D4AF37]" />
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#0F5132] leading-[1.1] tracking-tight mb-8">
              Preserving tradition through <br className="hidden md:block" />
              <span className="italic font-light text-[#D4AF37]">
                modern innovation.
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
              We built this academy on a singular vision: to make world-class, authentic Quranic education accessible to every Muslim household across the globe, regardless of borders or timezones.
            </p>
          </motion.div>
        </section>

        {/* --- TRUST METRICS (EDITORIAL TYPOGRAPHY NO CARDS) --- */}
        <section className="relative z-10 max-w-6xl mx-auto px-6 mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-[#0F5132]/10 border-y border-[#0F5132]/10 py-16"
          >
            <div className="text-center pt-8 md:pt-0 group cursor-default">
              <h3 className="text-6xl md:text-7xl font-serif text-[#0F5132] mb-4">500<span className="text-[#D4AF37]">+</span></h3>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Active Students</p>
            </div>
            <div className="text-center pt-8 md:pt-0 group cursor-default">
              <h3 className="text-6xl md:text-7xl font-serif text-gray-900 mb-4">50<span className="text-[#0F5132]">+</span></h3>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Certified Scholars</p>
            </div>
            <div className="text-center pt-8 md:pt-0 group cursor-default">
              <h3 className="text-6xl md:text-7xl font-serif text-[#0F5132] mb-4">12</h3>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Countries Reached</p>
            </div>
          </motion.div>
        </section>

        {/* --- OUR STORY (EDITORIAL IMAGE + TEXT SPLIT) --- */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 mb-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-md mx-auto lg:mx-0"
            >
              {/* Elegant Golden Offset Frame */}
              <div className="absolute inset-0 border border-[#D4AF37] -translate-x-6 -translate-y-6" />
              <img 
                src="https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&q=80"
                alt="Open Quran"
                className="relative z-10 w-full h-[500px] md:h-[600px] object-cover shadow-2xl grayscale-[10%]"
              />
              
              {/* Floating Quality Quote (Cardless) */}
              <div className="absolute -bottom-12 -right-8 md:-right-16 bg-white p-8 shadow-xl border border-[#0F5132]/5 max-w-[320px] z-20">
                <div className="flex gap-1 text-[#D4AF37] mb-4">
                  <Star className="fill-current w-4 h-4" />
                  <Star className="fill-current w-4 h-4" />
                  <Star className="fill-current w-4 h-4" />
                  <Star className="fill-current w-4 h-4" />
                  <Star className="fill-current w-4 h-4" />
                </div>
                <p className="text-lg font-serif text-gray-900 leading-snug italic mb-4">
                  "The most structured and professional Quran academy we have experienced in the UK."
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F5132]">— Parent in London</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-10 lg:pl-12 pt-16 lg:pt-0"
            >
              <div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 leading-[1.1] tracking-tight mb-8">
                  Bridging the gap between <span className="text-[#0F5132] italic font-light">tradition</span> and technology.
                </h2>
              </div>
              <div className="space-y-6 text-gray-600 font-light text-lg leading-relaxed">
                <p>
                  For Muslims living in Western countries, finding a qualified, authentic Quran tutor with native-level communication skills has historically been a profound challenge. Schedules clash, quality varies, and children often lose interest in rigid, unengaging environments.
                </p>
                <p>
                  We recognized this gap and built an academy that functions on the principles of top-tier Western educational institutions, combined with the pure, unaltered teachings of the Holy Quran. 
                </p>
                <div className="border-l-2 border-[#D4AF37] pl-8 py-2 mt-8">
                  <p className="text-[#0F5132] font-medium text-xl leading-relaxed italic">
                    Today, our interactive portal connects thousands of parents with hand-selected, deeply vetted scholars, providing complete transparency through live monitoring and automated progress reports.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- ACADEMIC PILLARS (EDITORIAL LIST) --- */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-32 border-t border-[#0F5132]/10">
          <div className="text-center mb-24">
            <span className="text-[#0F5132] font-black tracking-[0.2em] uppercase text-xs mb-4 block">
              Methodology
            </span>
            <h2 className="text-4xl md:text-6xl font-serif text-gray-900 tracking-tight">Our Academic Pillars</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-16 lg:gap-24">
            {pillars.map((pillar, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="w-16 h-16 border border-[#D4AF37]/50 rounded-full flex items-center justify-center mb-8 group-hover:bg-[#0F5132] group-hover:border-[#0F5132] transition-colors duration-500">
                  <pillar.icon className="w-6 h-6 text-[#0F5132] group-hover:text-white transition-colors duration-500" />
                </div>
                
                <h3 className="text-3xl font-serif text-gray-900 mb-6">{pillar.title}</h3>
                <p className="text-base text-gray-600 font-light leading-relaxed">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- FINAL CTA (EDITORIAL BLOCK) --- */}
        <section className="bg-[#0F5132] relative overflow-hidden py-32 px-6">
           <div className="absolute inset-0 bg-[url('/islamic-pattern.png')] opacity-5 mix-blend-overlay pointer-events-none" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none" />
           
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="relative z-10 max-w-4xl mx-auto text-center"
           >
              <h2 className="text-5xl md:text-7xl font-serif text-white mb-8 tracking-tight leading-tight">
                Experience the <span className="italic font-light text-[#D4AF37]">difference.</span>
              </h2>
              <p className="text-white/80 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed mb-12">
                Meet our teachers and experience our interactive terminal with a complimentary evaluation session.
              </p>
              
              <Link 
                href="/register" 
                className="group inline-flex items-center justify-center px-10 py-5 bg-white text-[#0F5132] font-black uppercase tracking-[0.2em] text-xs transition-transform hover:-translate-y-1"
              >
                <span className="flex items-center gap-3">
                  Book Free Trial <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
           </motion.div>
        </section>

      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}