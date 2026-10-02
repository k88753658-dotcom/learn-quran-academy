"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Testimonials() {
  const [showAll, setShowAll] = useState(false);

  const featuredReviews = [
    {
      id: 1,
      parentName: "Muhammad Bilal",
      location: "Islamabad, Pakistan",
      relation: "Father of Hashim (Age 9)",
      text: "Alhamdulillah, the structured multi-role portal is amazing. I can instantly pull up my son's progress report card as a PDF and see exactly what he practiced with his teacher today. Highly professional!",
      avatarText: "MB"
    },
    {
      id: 2,
      parentName: "Ayesha Khan",
      location: "Lahore, Pakistan",
      relation: "Mother of Zainab (Age 11)",
      text: "The 1-on-1 private live classroom terminal works flawlessly. My daughter never misses a class because the instructor pushes the link live straight to her student portal screen instantly. The Tajweed focus is exceptional.",
      avatarText: "AK"
    },
    {
      id: 3,
      parentName: "Dr. Kamran Ahmed",
      location: "Karachi, Pakistan",
      relation: "Father of Sofia (Age 7)",
      text: "I was looking for an academy that takes grading and workload balancing seriously. The administrative control ledger here ensures teachers are highly active and performance metrics are trackable.",
      avatarText: "KA"
    },
  ];

  const archiveReviews = [
    {
      id: 4,
      parentName: "Sami Abawi",
      location: "Connecticut, US",
      relation: "Parent",
      text: "I found Learn Quran Academy extremely helpful in providing a solid base for my 7 year old daughter in Quran reading. Her tutor is very friendly and professional. Also has good English communication skills.",
      avatarText: "SA"
    },
    {
      id: 5,
      parentName: "Tariq Rafeeq",
      location: "UK",
      relation: "Parent",
      text: "One of my sons has finished Quran in 8 months and other daughter who is 7 and is on 18 parah. My children are very happy with Learn Quran Academy.",
      avatarText: "TR"
    },
    {
      id: 6,
      parentName: "Mr. & Mrs. Adnan Khan",
      location: "Oslo, Norway",
      relation: "Parents",
      text: "We have started online classes for our kids with Learn Quran Academy almost 10 months back. Since then we are having a wonderful experience. Initially we thought it won't be easy for kids to focus online but we were not correct.",
      avatarText: "AK"
    },
    {
      id: 7,
      parentName: "Jankeh Gassama",
      location: "Manchester, UK",
      relation: "Parent",
      text: "Learn Quran Academy is the best. So reliable, effective and efficient. Thank you.",
      avatarText: "JG"
    },
    {
      id: 8,
      parentName: "Hadiya's Mother",
      location: "UK",
      relation: "Mother",
      text: "Keep up the good work I am learning with Learn Quran Academy for years to come. Insha Allah, my kids are happy so they are learning fast and enjoying it.",
      avatarText: "HM"
    },
    {
      id: 10,
      parentName: "Bilal Ahmed",
      location: "Berkeley, CA",
      relation: "Student",
      text: "I am a university student and want to get the basic Education about Quran without losing my regular studies, so Allah made my this easy for me. Now all of my sisters and brothers are getting it from Learn Quran Academy.",
      avatarText: "BA"
    }
  ];

  const displayedReviews = showAll ? [...featuredReviews, ...archiveReviews] : featuredReviews;

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-[#F9F9F9] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-[#0F5132]/5 blur-[140px] rounded-full mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/5 blur-[140px] rounded-full mix-blend-multiply" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* --- SECTION TITLE HEADER --- */}
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="w-12 h-[1px] bg-[#0F5132]/20" />
            <span className="text-[#0F5132] font-bold tracking-[0.3em] uppercase text-xs">
              Verified Feedback
            </span>
            <div className="w-12 h-[1px] bg-[#0F5132]/20" />
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-light text-gray-900 tracking-tight leading-tight"
          >
            Trusted By Parents <br className="hidden md:block" />
            <span className="font-serif italic text-[#D4AF37]">Worldwide</span>
          </motion.h2>
        </div>

        {/* --- MASONRY GRID VIEW --- */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-x-12 lg:gap-x-20">
          <AnimatePresence>
            {displayedReviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (idx % 3) * 0.1 }}
                className="relative break-inside-avoid mb-24 group"
              >
                {/* Massive Background Quote Mark */}
                <span className="text-[12rem] leading-none text-[#0F5132]/[0.03] font-serif absolute -top-16 -left-8 select-none pointer-events-none z-0 transition-colors duration-500 group-hover:text-[#D4AF37]/10">
                  &ldquo;
                </span>
                
                <div className="relative z-10 pl-4 md:pl-8 border-l border-[#0F5132]/10 group-hover:border-[#0F5132]/40 transition-colors duration-500">
                  <p className="text-gray-800 text-lg md:text-xl font-light leading-relaxed mb-8">
                    {review.text}
                  </p>
                  
                  <div>
                    <h4 className="text-[#0F5132] font-bold tracking-[0.2em] uppercase text-sm mb-2">
                      {review.parentName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[#D4AF37] text-xs uppercase tracking-widest font-medium">
                        {review.relation}
                      </span>
                      <span className="text-gray-300 text-xs">&bull;</span>
                      <span className="text-gray-500 text-xs uppercase tracking-widest">
                        {review.location}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* --- BUTTON --- */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <button
            onClick={() => setShowAll(!showAll)}
            className="group relative inline-flex items-center justify-center px-12 py-5 text-sm uppercase tracking-[0.2em] text-[#0F5132] border border-[#0F5132]/20 hover:border-[#0F5132] transition-colors duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#0F5132]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <span className="relative z-10 flex items-center gap-3">
              {showAll ? "Read Less" : "Read More Stories"}
            </span>
          </button>
        </motion.div>

      </div>
    </section>
  );
}