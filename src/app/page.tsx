"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  GraduationCap, CalendarClock, LineChart, ShieldCheck, ArrowRight 
} from "lucide-react";

// Modular components
import TajweedShowcase from "@/components/TajweedShowcase";
import PrayerTimes from "@/components/PrayerTimes";
import TeachersSection from "@/components/TeachersSection";
import BlogPreview from "@/components/BlogPreview";
import Testimonials from "@/components/Testimonials";
import CourseSection from "@/components/CourseSection";
import CourseMatcher from "@/components/CourseMatcher";
import WhatsAppButton from "@/components/WhatsAppButton";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

// --- CARDLESS INTERACTIVE CALCULATOR ---
const InteractiveCalculator = () => {
  const [kidsCount, setKidsCount] = useState(1);
  const [currency, setCurrency] = useState<"USD" | "GBP" | "AUD">("USD");
  
  const rates = { USD: { symbol: "$", rate: 30 }, GBP: { symbol: "£", rate: 24 }, AUD: { symbol: "A$", rate: 45 } };
  const monthlyFee = kidsCount * rates[currency].rate;
  
  return (
    <section className="py-16 md:py-24 px-6 relative z-20 border-t border-[#D4AF37]/10 bg-gradient-to-b from-[#F8FAFC] to-transparent">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
        
        {/* Left Typography Side */}
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-3">
            <span className="w-10 h-[2px] bg-[#D4AF37]" />
            <span className="text-[#0F5132] text-xs font-black uppercase tracking-[0.3em]">Transparent Pricing</span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none">
            Honest,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F5132] to-[#D4AF37] italic font-serif">Flat-Rate</span> Tuition.
          </h2>
          <p className="text-gray-600 text-lg max-w-md font-medium leading-relaxed">
            No hidden fees. No surprises. Select your currency and adjust for your family size to see your exact monthly investment instantly.
          </p>

          {/* Value Props Inline */}
          <div className="space-y-4 pt-6 border-t border-[#D4AF37]/20">
            <p className="flex items-center gap-4 text-sm font-bold text-gray-900 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> 4 Interactive Classes / Week
            </p>
            <p className="flex items-center gap-4 text-sm font-bold text-gray-900 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> 30 Mins / Session
            </p>
            <p className="flex items-center gap-4 text-sm font-bold text-[#0F5132] uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#0F5132]" /> Missed Classes Rescheduled
            </p>
          </div>
        </div>

        {/* Right Interactive Side (No Cards, Floating Elements) */}
        <div className="flex-1 w-full max-w-xl">
          <div className="relative">
            {/* Massive Price Display */}
            <div className="flex items-baseline mb-12">
              <motion.span 
                key={monthlyFee}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-8xl md:text-[9rem] font-black text-gray-900 tracking-tighter leading-none"
              >
                {rates[currency].symbol}{monthlyFee}
              </motion.span>
              <span className="text-xl font-black text-[#D4AF37] uppercase tracking-widest ml-4">/ mo</span>
            </div>

            {/* Slider */}
            <div className="mb-12">
              <div className="flex justify-between items-end mb-6">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Number of Students</span>
                <span className="text-4xl font-black text-[#D4AF37]">{kidsCount}</span>
              </div>
              <input 
                type="range" min="1" max="5" value={kidsCount} onChange={(e) => setKidsCount(parseInt(e.target.value))}
                className="w-full h-1 bg-[#D4AF37]/20 rounded-full appearance-none cursor-pointer accent-[#D4AF37]"
              />
            </div>

            {/* Currency Toggles (Floating Text) */}
            <div className="flex gap-8">
              {(["USD", "GBP", "AUD"] as const).map((cur) => (
                <button 
                  key={cur} onClick={() => setCurrency(cur)}
                  className={`text-sm font-black uppercase tracking-[0.2em] transition-all relative ${currency === cur ? "text-[#D4AF37]" : "text-gray-400 hover:text-gray-900"}`}
                >
                  {cur}
                  {currency === cur && (
                    <motion.div layoutId="currency-dot" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- CARDLESS EDITORIAL ZIG-ZAG FEATURES ---
const EditorialFeatures = () => {
  return (
    <section className="py-16 md:py-24 px-6 relative z-20 max-w-7xl mx-auto space-y-20 md:space-y-32 bg-[#FFFFFF]">
      
      {/* Feature 1 */}
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
          <div className="absolute -inset-10 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-3xl -z-10" />
          <div className="w-32 h-32 mb-8 bg-[#0F5132] rounded-full flex items-center justify-center shadow-2xl">
            <GraduationCap className="w-12 h-12 text-[#FFFFFF]" />
          </div>
          <h3 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">
            Traditionally <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F5132] to-[#D4AF37] italic font-serif">Certified</span> Scholars
          </h3>
          <p className="text-lg text-gray-600 leading-relaxed font-medium">
            Our instructors aren't just native speakers; they hold authentic Ijazahs tracing back through generations. We combine the deep spiritual understanding of the Madrasah with modern, interactive technology.
          </p>
        </div>
        <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-sm">
            {/* Elegant Golden Offset Frame */}
            <div className="absolute inset-0 border border-[#D4AF37] translate-x-4 translate-y-4" />
            <img 
              src="https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80" 
              alt="Traditional Learning"
              className="relative z-10 w-full h-[400px] md:h-[500px] object-cover shadow-xl grayscale-[10%]"
            />
          </div>
        </div>
      </div>

      {/* Feature 2 */}
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="flex justify-center lg:justify-start">
          <div className="relative w-full max-w-sm">
            {/* Elegant Solid Offset Box */}
            <div className="absolute inset-0 bg-[#0F5132] -translate-x-4 -translate-y-4" />
            <img 
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80" 
              alt="Flexible Scheduling"
              className="relative z-10 w-full h-[400px] md:h-[500px] object-cover shadow-xl grayscale-[10%]"
            />
          </div>
        </div>
        <div className="relative">
          <div className="w-24 h-24 mb-8 bg-gradient-to-br from-[#D4AF37] to-[#0F5132] rounded-full flex items-center justify-center shadow-xl">
            <CalendarClock className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">
            Flawlessly <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F5132] to-[#D4AF37] italic font-serif">Flexible</span> Scheduling
          </h3>
          <p className="text-lg text-gray-600 leading-relaxed font-medium mb-8">
            Classes designed entirely around your local time zone. Traveling or unwell? Reschedule easily with 24-hour notice through our smart portal.
          </p>
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-full border border-[#D4AF37]/30 flex items-center justify-center">
               <LineChart className="w-6 h-6 text-[#0F5132]" />
             </div>
             <div>
               <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Live Tracking</h4>
               <p className="text-xs text-gray-500 font-bold mt-1">Daily Logs & Reports</p>
             </div>
          </div>
        </div>
      </div>

      {/* Feature 3 (Full width Breakout) */}
      <div className="relative py-16 md:py-24 text-center">
        <div className="absolute inset-0 bg-[#0F5132] w-screen left-1/2 -translate-x-1/2 -z-10" />
        <div className="absolute inset-0 w-screen left-1/2 -translate-x-1/2 bg-[url('/islamic-pattern.png')] opacity-[0.03] bg-repeat pointer-events-none -z-10" />
        
        <div className="w-24 h-24 mx-auto mb-10 border border-[#FFFFFF]/30 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-10 h-10 text-[#FFFFFF]" />
        </div>
        <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8">
          100% Safe <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] to-[#D4AF37] italic font-serif">Environment</span>
        </h3>
        <p className="text-xl text-[#FFFFFF]/80 max-w-2xl mx-auto font-medium mb-12">
          Secure, strictly 1-on-1 recorded sessions ensuring complete peace of mind and absolute privacy for parents worldwide.
        </p>
        <button className="group relative overflow-hidden bg-transparent border border-[#D4AF37] text-[#FFFFFF] text-xs font-black uppercase tracking-[0.2em] px-12 py-5 rounded-full hover:bg-[#D4AF37] transition-all duration-500">
          Start Your Free Trial
        </button>
      </div>

    </section>
  );
};

export default function Home() {
  return (
    <>
      <Navbar />
      
      <main className="min-h-screen w-full bg-[#FFFFFF] text-gray-900 relative overflow-x-hidden selection:bg-[#0F5132] selection:text-white">
        
        {/* Minimal Ambient Backgrounds */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-20 right-[-10%] w-[500px] md:w-[600px] h-[500px] md:h-[600px] bg-[#0F5132]/5 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] left-[-10%] w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 space-y-0 pb-0">
          <Hero />
          
          <ScrollReveal>
            <InteractiveCalculator />
          </ScrollReveal>
          
          <ScrollReveal>
            <EditorialFeatures />
          </ScrollReveal>

          {/* THE NEW SMART COURSE MATCHER INJECTED HERE */}
          <ScrollReveal>
            <CourseMatcher />
          </ScrollReveal>

          <ScrollReveal>
            <TajweedShowcase />
          </ScrollReveal>
          
          <ScrollReveal>
            <PrayerTimes />
          </ScrollReveal>
          
          <ScrollReveal><CourseSection /></ScrollReveal>
          <ScrollReveal><Testimonials /></ScrollReveal>
          <ScrollReveal><TeachersSection /></ScrollReveal>
          <ScrollReveal><BlogPreview /></ScrollReveal>
        </div>
      </main>

      <WhatsAppButton />
      <Footer />
    </>
  );
}