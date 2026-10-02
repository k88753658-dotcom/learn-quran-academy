"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen, Brain, User, Baby, RefreshCcw } from "lucide-react";

export default function CourseMatcher() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    student: "",
    level: "",
    goal: ""
  });

  const handleAnswer = (key: string, value: string) => {
    setAnswers({ ...answers, [key]: value });
    setStep(step + 1);
  };

  const resetQuiz = () => {
    setStep(1);
    setAnswers({ student: "", level: "", goal: "" });
  };

  const getRecommendation = () => {
    if (answers.level === "Absolute Beginner") return {
      title: "Noorani Qaida Foundation",
      desc: "The perfect starting point to recognize Arabic letters and master basic pronunciation.",
      link: "/register?course=noorani-qaida",
      icon: BookOpen,
    };
    if (answers.goal === "Memorize the Quran") return {
      title: "Quran Memorization",
      desc: "A structured, specialized program with daily revision tracking to commit the Quran to memory.",
      link: "/register?course=memorization",
      icon: Brain,
    };
    return {
      title: "Reading with Tajweed",
      desc: "Perfect your recitation with advanced Makharij and beautiful, melodic Tajweed rules.",
      link: "/register?course=tajweed",
      icon: Sparkles,
    };
  };

  const splitTitle = (title: string) => {
    const words = title.split(' ');
    if (words.length === 1) return { first: words[0], rest: "" };
    return {
      first: words[0],
      rest: words.slice(1).join(' ')
    };
  };

  const recommendation = getRecommendation();

  return (
    <section className="relative w-full py-16 md:py-24 px-6 min-h-[80vh] flex flex-col justify-center overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-[#D4AF37]/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-[#0F5132]/5 blur-[120px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3" />
      
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center mb-24 relative z-20">
        <div className="text-xs font-black tracking-[0.4em] uppercase text-[#D4AF37]">
          Curriculum Matcher
        </div>
        {step < 4 && (
          <div className="flex items-center gap-4 md:gap-6 text-[#D4AF37]">
            <span className="text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">0{step} / 03</span>
            <div className="w-12 md:w-32 h-px bg-[#D4AF37]/30 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-[#D4AF37]"
                initial={{ width: "33%" }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10 flex-grow flex items-center">
        <AnimatePresence mode="wait">
          
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col md:flex-row gap-16 md:gap-24 w-full items-center"
            >
              <div className="md:w-1/2 relative w-full">
                <h2 className="text-6xl md:text-8xl font-black text-[#0F5132] leading-[0.9] tracking-tighter relative z-10">
                  Who is <br />
                  <span className="text-[#D4AF37] italic font-serif font-light text-5xl md:text-7xl">embarking</span><br />
                  on this journey?
                </h2>
                <User className="absolute -top-12 -left-12 w-48 h-48 text-[#0F5132]/5 -rotate-12 pointer-events-none" />
              </div>
              <div className="md:w-1/2 flex flex-col w-full relative z-10 mt-8 md:mt-0">
                <button onClick={() => handleAnswer("student", "Child")} className="group text-left relative py-8 border-b border-gray-200 flex items-center justify-between overflow-hidden">
                  <span className="text-4xl md:text-6xl font-black text-gray-300 group-hover:text-[#0F5132] transition-colors duration-500 relative z-10 tracking-tight">My Child</span>
                  <Baby className="w-12 h-12 text-[#D4AF37] opacity-0 group-hover:opacity-100 group-hover:-translate-x-4 transition-all duration-700 ease-[0.22,1,0.36,1] relative z-10" />
                </button>
                <button onClick={() => handleAnswer("student", "Adult")} className="group text-left relative py-8 border-b border-gray-200 flex items-center justify-between overflow-hidden">
                  <span className="text-4xl md:text-6xl font-black text-gray-300 group-hover:text-[#0F5132] transition-colors duration-500 relative z-10 tracking-tight">Myself</span>
                  <User className="w-12 h-12 text-[#D4AF37] opacity-0 group-hover:opacity-100 group-hover:-translate-x-4 transition-all duration-700 ease-[0.22,1,0.36,1] relative z-10" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col md:flex-row gap-16 md:gap-24 w-full items-center"
            >
              <div className="md:w-1/2 relative w-full">
                <h2 className="text-6xl md:text-8xl font-black text-[#0F5132] leading-[0.9] tracking-tighter relative z-10">
                  Assess <br />
                  <span className="text-[#D4AF37] italic font-serif font-light text-5xl md:text-7xl">the current</span><br />
                  level.
                </h2>
                <BookOpen className="absolute -top-16 -right-16 w-64 h-64 text-[#0F5132]/5 rotate-12 pointer-events-none" />
              </div>
              <div className="md:w-1/2 flex flex-col w-full relative z-10 mt-8 md:mt-0">
                {["Absolute Beginner", "Knows Alphabets", "Can Read Slowly"].map((level) => (
                  <button key={level} onClick={() => handleAnswer("level", level)} className="group text-left relative py-6 border-b border-gray-200 flex items-center justify-between overflow-hidden last:border-b-0">
                    <span className="text-3xl md:text-5xl font-black text-gray-300 group-hover:text-[#0F5132] transition-colors duration-500 relative z-10 tracking-tight">{level}</span>
                    <ArrowRight className="w-8 h-8 md:w-10 md:h-10 text-[#D4AF37] opacity-0 group-hover:opacity-100 group-hover:-translate-x-4 transition-all duration-700 ease-[0.22,1,0.36,1] relative z-10" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col md:flex-row gap-16 md:gap-24 w-full items-center"
            >
              <div className="md:w-1/2 relative w-full">
                <h2 className="text-6xl md:text-8xl font-black text-[#0F5132] leading-[0.9] tracking-tighter relative z-10">
                  What is <br />
                  <span className="text-[#D4AF37] italic font-serif font-light text-5xl md:text-7xl">the ultimate</span><br />
                  goal?
                </h2>
                <Brain className="absolute -bottom-16 -left-16 w-56 h-56 text-[#0F5132]/5 -rotate-6 pointer-events-none" />
              </div>
              <div className="md:w-1/2 flex flex-col w-full relative z-10 mt-8 md:mt-0">
                {[
                  { label: "Read Correctly", val: "Learn to Read Correctly", icon: BookOpen },
                  { label: "Memorize (Hifz)", val: "Memorize the Quran", icon: Brain }
                ].map((opt) => (
                  <button key={opt.val} onClick={() => handleAnswer("goal", opt.val)} className="group text-left relative py-8 border-b border-gray-200 flex items-center justify-between overflow-hidden last:border-b-0">
                    <span className="text-3xl md:text-5xl font-black text-gray-300 group-hover:text-[#0F5132] transition-colors duration-500 relative z-10 tracking-tight">{opt.label}</span>
                    <opt.icon className="w-10 h-10 md:w-12 md:h-12 text-[#D4AF37] opacity-0 group-hover:opacity-100 group-hover:-translate-x-4 transition-all duration-700 ease-[0.22,1,0.36,1] relative z-10" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* RESULT STEP */}
          {step === 4 && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col md:flex-row items-center gap-16 md:gap-32 w-full"
            >
              <div className="md:w-1/2 relative z-10 order-2 md:order-1">
                <div className="inline-flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-8">
                  <Sparkles className="w-4 h-4" /> Perfect Match
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-[#0F5132] leading-[0.9] tracking-tighter mb-8">
                  {splitTitle(recommendation.title).first} <br/>
                  <span className="text-[#D4AF37] italic font-serif font-light text-5xl md:text-7xl">{splitTitle(recommendation.title).rest}</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-600 max-w-md leading-relaxed mb-16">
                  {recommendation.desc}
                </p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                  <Link href={recommendation.link} className="relative overflow-hidden inline-flex items-center gap-4 bg-[#0F5132] text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs group transition-all duration-500">
                    <div className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1]" />
                    <span className="relative z-10 group-hover:text-white transition-colors duration-500">Begin Journey</span>
                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:text-white group-hover:translate-x-2 transition-all duration-500" />
                  </Link>
                  <button onClick={resetQuiz} className="text-xs font-bold text-gray-400 hover:text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-2 transition-colors duration-500">
                    <RefreshCcw className="w-3 h-3" /> Start Over
                  </button>
                </div>
              </div>
              
              <div className="md:w-1/2 w-full relative flex justify-center items-center order-1 md:order-2 h-[40vh] md:h-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className="relative z-0"
                >
                  <recommendation.icon className="w-64 h-64 md:w-96 md:h-96 text-[#0F5132]/5" strokeWidth={0.5} />
                </motion.div>
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center z-10"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                >
                  <recommendation.icon className="w-32 h-32 md:w-48 md:h-48 text-[#D4AF37]" strokeWidth={1} />
                </motion.div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
}