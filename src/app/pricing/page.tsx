"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CheckCircle2, ChevronDown, Sparkles, ShieldCheck, Phone, ArrowRight } from "lucide-react";

export default function PricingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const plans = [
    {
      name: "Basic",
      days: "2 Days / Week",
      price: "$30",
      duration: "30 Min Sessions",
      highlighted: false,
      tag: "",
      features: [
        "1-on-1 Live Sessions",
        "Male/Female Tutors",
        "Monthly Progress Reports",
        "Make-up Classes Available"
      ]
    },
    {
      name: "Standard",
      days: "3 Days / Week",
      price: "$45",
      duration: "30 Min Sessions",
      highlighted: true,
      tag: "MOST POPULAR",
      features: [
        "Everything in Basic",
        "Faster Progression",
        "Dedicated Coordinator",
        "Interactive Portal Access"
      ]
    },
    {
      name: "Intensive",
      days: "5 Days / Week",
      price: "$65",
      duration: "30 Min Sessions",
      highlighted: false,
      tag: "HIFZ PREFERRED",
      features: [
        "Everything in Standard",
        "Ideal for Hifz Students",
        "Daily Revision Tracking",
        "Priority Support Line"
      ]
    }
  ];

  const faqs = [
    {
      question: "Do you offer a free trial?",
      answer: "Yes! We offer a 3-day no-obligation free trial. This allows you to evaluate our teaching methodology, the teacher's accent, and our interactive portal before making any payment."
    },
    {
      question: "What happens if we miss a class?",
      answer: "We understand that family schedules can be unpredictable. If you miss a class and inform us in advance, we will gladly arrange a make-up class on the weekend or extend your next session."
    },
    {
      question: "Are there any hidden registration fees?",
      answer: "Absolutely not. We believe in complete transparency. You only pay the flat monthly fee based on the plan you select. There are no admission, registration, or hidden portal fees."
    },
    {
      question: "Can we choose a female tutor for our daughters?",
      answer: "Yes, we have a dedicated team of highly qualified and experienced female scholars specifically for sisters and daughters to ensure 100% comfort and privacy."
    },
    {
      question: "Do you offer discounts for multiple children?",
      answer: "Yes. We offer special sibling discounts to make Islamic education affordable for larger families. Please contact our support team for a custom quote."
    }
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F9F9F9] text-gray-900 pt-32 pb-24 relative overflow-hidden font-sans selection:bg-[#0F5132] selection:text-white">
        
        {/* --- PREMIUM AMBIENT GLOWS --- */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#D4AF37]/10 blur-[120px] rounded-full z-0 pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-[#0F5132]/5 blur-[120px] rounded-full z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* --- HERO SECTION --- */}
          <section className="text-center max-w-3xl mx-auto mb-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-3 justify-center mb-4">
                <span className="w-10 h-[2px] bg-[#D4AF37]" />
                <span className="text-[#0F5132] text-xs font-black uppercase tracking-[0.3em]">Transparent Tuition</span>
                <span className="w-10 h-[2px] bg-[#D4AF37]" />
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#0F5132] leading-none tracking-tight">
                Invest in their <br />
                <span className="text-[#D4AF37] italic font-light">Akhirah</span>
              </h1>
              <p className="text-xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto mt-8">
                No hidden fees. No complicated contracts. Choose a schedule that comfortably fits your family's routine. Start with a 3-day free trial.
              </p>
            </motion.div>
          </section>

          {/* --- EDITORIAL PRICING COLUMNS (NO CARDS) --- */}
          <div className="max-w-6xl mx-auto mb-32 border-y border-[#0F5132]/10">
            <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#0F5132]/10">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative p-10 md:p-14 flex flex-col group hover:bg-[#0F5132]/[0.02] transition-colors duration-500"
                >
                  {/* Floating Tag */}
                  {plan.tag && (
                    <div className="absolute top-0 right-10 -translate-y-1/2 bg-[#D4AF37] text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> {plan.tag}
                    </div>
                  )}
                  
                  <h3 className="text-4xl font-serif text-[#0F5132] mb-2 tracking-tight group-hover:text-[#D4AF37] transition-colors duration-500">
                    {plan.name}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-12">
                    {plan.days}
                  </p>

                  <div className="mb-12">
                    <span className="text-7xl font-serif text-gray-900 tracking-tighter">{plan.price}</span>
                    <span className="font-medium text-gray-400 ml-2 uppercase tracking-widest text-xs">/ mo</span>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mt-4 text-[#0F5132]/60">
                      {plan.duration}
                    </p>
                  </div>

                  <div className="space-y-5 mb-16 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-1.5 h-1.5 mt-2 rounded-full bg-[#D4AF37] shrink-0" />
                        <span className="text-sm font-medium text-gray-600 leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link 
                    href={`/register?plan=${plan.name.replace(' ', '-').toLowerCase()}`} 
                    className="group/btn relative inline-flex items-center justify-between w-full py-5 border-b border-[#0F5132]/20 hover:border-[#0F5132] transition-colors duration-500"
                  >
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-[#0F5132]">Select Plan</span>
                    <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover/btn:translate-x-2 transition-transform duration-500" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* --- EDITORIAL FAQ SECTION --- */}
          <div className="max-w-4xl mx-auto mb-32">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <span className="text-[#0F5132] font-black tracking-[0.2em] uppercase text-xs mb-4 block">
                  Clarifications
                </span>
                <h2 className="text-4xl md:text-6xl font-serif text-gray-900 tracking-tight">
                  Common <br /><span className="italic font-light text-[#D4AF37]">Inquiries</span>
                </h2>
              </div>
            </div>
            
            <div className="space-y-0 border-t border-[#0F5132]/10">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="border-b border-[#0F5132]/10"
                >
                  <button 
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full text-left py-8 flex justify-between items-center focus:outline-none group"
                  >
                    <span className="font-serif text-2xl text-gray-900 pr-8 group-hover:text-[#0F5132] transition-colors duration-300">
                      {faq.question}
                    </span>
                    <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 flex items-center justify-center shrink-0 group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/5 transition-all duration-300">
                      <ChevronDown className={`w-4 h-4 text-[#D4AF37] transition-transform duration-500 ${activeFaq === index ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-8 text-gray-600 font-light text-lg leading-relaxed max-w-3xl">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* --- CUSTOM PLAN CTA (EDITORIAL BANNER) --- */}
          <section className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#0F5132] relative overflow-hidden py-24 px-6 md:px-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-12"
            >
              <div className="absolute inset-0 bg-[url('/islamic-pattern.png')] opacity-5 mix-blend-overlay pointer-events-none" />
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
              
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 tracking-tight">
                  Need a bespoke <span className="italic text-[#D4AF37]">schedule?</span>
                </h2>
                <p className="text-white/80 font-light text-lg leading-relaxed">
                  If you need 4 days a week, weekend-only classes, or a special sibling bundle, reach out to our team. We will structure an academic plan specifically for your family.
                </p>
              </div>
              
              <div className="relative z-10 shrink-0">
                <Link 
                  href="/contact" 
                  className="group inline-flex items-center justify-center px-10 py-5 bg-white text-[#0F5132] font-black uppercase tracking-[0.2em] text-xs transition-transform hover:-translate-y-1"
                >
                  <span className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#D4AF37]" /> Contact Us
                  </span>
                </Link>
              </div>
            </motion.div>
          </section>

        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}