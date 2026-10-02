"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Mic2, Volume2, Sparkles } from "lucide-react";

// Dummy data: Replace 'src' with actual MP3 files later
const recitationTracks = [
  {
    id: 1,
    qari: "Sheikh Abdullah",
    surah: "Surah Ar-Rahman",
    arabic: "الرحمن",
    style: "Hafs 'an 'Asim",
    src: "/audio/track1.mp3",
  },
  {
    id: 2,
    qari: "Ustadha Fatima",
    surah: "Surah Al-Mulk",
    arabic: "الملك",
    style: "Clear & Slow",
    src: "/audio/track2.mp3",
  },
  {
    id: 3,
    qari: "Sheikh Ibrahim",
    surah: "Surah Al-Kahf",
    arabic: "الكهف",
    style: "Melodic & Deep",
    src: "/audio/track3.mp3",
  }
];

export default function TajweedShowcase() {
  const [activeTrack, setActiveTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle Play/Pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // When changing tracks, reset play state
  const changeTrack = (index: number) => {
    setActiveTrack(index);
    setIsPlaying(false);
    // Auto-play the new track after a tiny delay
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }, 100);
  };

  return (
    <section className="relative w-full bg-[#F9F9F9] py-16 md:py-24 overflow-hidden flex flex-col items-center justify-center min-h-screen">
      {/* Massive Background Arabic Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTrack}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 0.03, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="text-[20rem] md:text-[30rem] lg:text-[45rem] font-serif text-[#0F5132] leading-none whitespace-nowrap"
            dir="rtl"
          >
            {recitationTracks[activeTrack].arabic}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle Radial Gradient for depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0F5132]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hidden HTML5 Audio Element */}
      <audio 
        ref={audioRef} 
        src={recitationTracks[activeTrack].src} 
        onEnded={() => setIsPlaying(false)}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-16 items-center">
        
        {/* LEFT CONTENT: Typography & Player */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-8"
            >
              <Mic2 className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-[#0F5132] text-xs font-black uppercase tracking-[0.3em]">Absolute Authenticity</span>
            </motion.div>
            
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-tight mb-8">
              Hear the <br/>
              <span className="font-serif italic text-[#0F5132] font-light">Difference.</span>
            </h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-lg leading-relaxed font-light">
              Experience the flawless Tajweed and beautiful pronunciation of our certified scholars. This is the exact quality of education your child will receive.
            </p>
          </div>

          {/* Current Track Info & Controls */}
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <button 
              onClick={togglePlay}
              className="w-24 h-24 shrink-0 rounded-full border border-gray-300 flex items-center justify-center text-[#0F5132] hover:bg-[#0F5132]/5 hover:border-[#0F5132] hover:scale-105 transition-all duration-700 ease-out group relative bg-white shadow-sm hover:shadow-md"
            >
              <div className={`absolute inset-0 rounded-full border border-[#0F5132] transition-all duration-1000 ${isPlaying ? 'scale-[1.15] opacity-0' : 'opacity-0'}`} />
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-current text-[#0F5132] transition-colors" />
              ) : (
                <Play className="w-8 h-8 fill-current ml-2 text-[#0F5132] transition-colors" />
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs text-[#D4AF37] uppercase tracking-[0.2em] font-bold">Now Playing</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTrack}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <h3 className="text-4xl font-serif text-gray-900 mb-2">{recitationTracks[activeTrack].surah}</h3>
                  <p className="text-[#0F5132] tracking-[0.1em] text-sm uppercase font-medium">{recitationTracks[activeTrack].qari}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Minimalist Waveform */}
          <div className="mt-12 flex items-center gap-2 h-12 w-full max-w-md">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                animate={isPlaying ? { height: ["10%", "100%", "30%", "80%", "10%"] } : { height: "10%" }}
                transition={isPlaying ? { duration: 1.5, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" } : { duration: 0.5 }}
                className={`flex-1 rounded-full ${isPlaying ? 'bg-[#D4AF37]' : 'bg-gray-200'}`}
                style={{ minHeight: "2px" }}
              />
            ))}
          </div>

        </div>

        {/* RIGHT CONTENT: Track List */}
        <div className="lg:col-span-5 flex flex-col gap-0 border-t border-gray-200 pt-12 mt-12 lg:mt-0 lg:border-t-0 lg:pt-0 lg:pl-12 lg:border-l">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F5132]">Select Recitation</h4>
            <Volume2 className="w-5 h-5 text-[#0F5132]" />
          </div>

          <div className="flex flex-col">
            {recitationTracks.map((track, index) => {
              const isActive = activeTrack === index;
              return (
                <div 
                  key={track.id}
                  onClick={() => changeTrack(index)}
                  className={`group relative py-8 cursor-pointer flex items-center justify-between border-b border-gray-100 transition-all duration-500 hover:pl-6 ${isActive ? 'pl-6 border-gray-200' : ''}`}
                >
                  {/* Hover indicator line */}
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[#0F5132] transition-all duration-500 group-hover:h-1/2 ${isActive ? 'h-1/2' : ''}`} />

                  <div>
                    <h4 className={`text-2xl font-serif mb-2 transition-colors duration-300 ${isActive ? "text-[#0F5132]" : "text-gray-600 group-hover:text-gray-900"}`}>
                      {track.surah}
                    </h4>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${isActive ? "text-[#D4AF37]" : "text-gray-400 group-hover:text-[#D4AF37]"}`}>
                      {track.qari} &mdash; <span className="font-light tracking-normal capitalize opacity-80">{track.style}</span>
                    </p>
                  </div>
                  
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-500 ${
                    isActive 
                      ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]" 
                      : "border-transparent text-gray-300 group-hover:border-gray-200 group-hover:text-[#0F5132]"
                  }`}>
                    {isActive && isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-1" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}