"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { academyCourses } from "@/lib/courseData";

export default function CourseSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-24 bg-[#F9F9F9] text-gray-900 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#D4AF37]/10 blur-[120px] rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#0F5132]/5 blur-[100px] rounded-full z-0 pointer-events-none" />

      <div className="max-w-[90rem] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Typography */}
        <div className="mb-24 md:flex justify-between items-end">
          <div className="max-w-3xl">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[#0F5132] font-semibold tracking-[0.3em] uppercase text-sm mb-8"
            >
              Academic Curriculums
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight leading-none text-gray-900"
            >
              Specialized
              <br />
              <span className="italic text-[#D4AF37] font-light">Study Tracks</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-md mt-12 md:mt-0 pb-4"
          >
            <p className="text-gray-600 text-lg lg:text-xl font-light leading-relaxed">
              Structured programs mapped straight into our multi-role digital terminal, complete with parent-ready performance reports.
            </p>
          </motion.div>
        </div>

        {/* List Grid */}
        <div className="border-t border-gray-200 relative z-20">
          {academyCourses.map((course, index) => (
            <motion.div
              key={course.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative border-b border-gray-200 py-12 md:py-16 transition-colors duration-500 hover:bg-white"
            >
              <Link href={`/courses/${course.id || ""}`} className="block absolute inset-0 z-10" aria-label={`View details for ${course.title}`} />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-16 relative z-20 pointer-events-none px-4 lg:px-8">
                
                <div className="flex items-start lg:items-center gap-6 lg:gap-12 lg:w-1/2">
                  <span className="text-gray-300 font-light text-3xl md:text-5xl lg:text-6xl w-12 md:w-20 shrink-0 group-hover:text-[#0F5132]/20 transition-colors duration-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <span className="text-[#D4AF37] text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-3 block">
                      {course.level || "Track"}
                    </span>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 group-hover:text-[#0F5132] transition-colors duration-500 leading-tight">
                      {course.title}
                    </h3>
                  </div>
                </div>

                <div className="lg:w-1/3 flex flex-col justify-center pl-16 lg:pl-0">
                  <p className="text-gray-600 text-sm md:text-base font-light leading-relaxed group-hover:text-gray-900 transition-colors duration-500">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-8 lg:gap-12 lg:w-1/6 pl-16 lg:pl-0 mt-4 lg:mt-0">
                  <span className="text-[#0F5132] text-xs md:text-sm font-semibold tracking-[0.2em] uppercase">
                    {course.duration || "Flexible"}
                  </span>
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] transition-all duration-500 shrink-0">
                    <svg 
                      className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-white transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </div>
                </div>

              </div>

              {/* Floating Hover Element */}
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    layoutId="hoverBackground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0F5132]/5 to-transparent pointer-events-none"
                  />
                )}
              </AnimatePresence>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}