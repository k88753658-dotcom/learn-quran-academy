"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { academyBlogs } from "@/lib/blogData";

const IMAGES = [
  "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580674684081-77673534125b?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1574343163273-0ce2b3390c29?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1583089892943-e02e52f17849?auto=format&fit=crop&q=80",
];

export default function BlogPreview() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative py-16 md:py-24 bg-[#F9F9F9] min-h-screen overflow-hidden">
      {/* Editorial Background Reveal */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              key={hoveredIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.1, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${IMAGES[hoveredIndex % IMAGES.length]})` }}
            />
          )}
        </AnimatePresence>
        {/* Seamless Blend Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F9F9F9] via-transparent to-[#F9F9F9]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* High-End Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-32">
          <div className="space-y-6 max-w-3xl">
            <span className="text-[#0F5132] font-light tracking-[0.3em] uppercase text-xs">
              Academy Journals
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif text-gray-900 leading-[1.1] tracking-tight">
              Insights on <br />
              <span className="italic font-light text-[#D4AF37]">Quranic Literacy</span>
            </h2>
          </div>
          
          <motion.div whileHover={{ x: 10 }}>
            <Link 
              href="/blog" 
              className="text-[#D4AF37] hover:text-[#0F5132] transition-colors text-sm font-light uppercase tracking-[0.2em] flex items-center gap-6"
            >
              Explore Archive
              <span className="w-16 h-[1px] bg-current" />
            </Link>
          </motion.div>
        </div>

        {/* Magazine-Style Editorial List */}
        <div className="flex flex-col space-y-20 lg:space-y-32">
          {academyBlogs.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Link 
                href={`/blog/${post.slug}`} 
                className="block group relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 lg:gap-16">
                  
                  {/* Floating Typography Index & Meta */}
                  <div className="flex lg:flex-col items-center lg:items-start gap-6 lg:gap-2 lg:w-1/5 pt-2">
                    <span className="text-gray-300 group-hover:text-[#D4AF37] transition-colors duration-500 font-serif text-3xl md:text-5xl italic">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="w-8 h-[1px] bg-gray-300 hidden lg:block my-4" />
                    <span className="text-xs uppercase tracking-[0.2em] text-[#0F5132]">
                      {post.category}
                    </span>
                  </div>

                  {/* Massive Title & Expandable Excerpt */}
                  <div className="lg:w-3/5 space-y-6 z-10 relative">
                    <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 group-hover:text-[#0F5132] transition-colors duration-500 leading-[1.1] tracking-tight">
                      {post.title}
                    </h3>
                    
                    {/* Hover Reveal Block */}
                    <motion.div 
                      className="overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: hoveredIndex === index ? "auto" : 0,
                        opacity: hoveredIndex === index ? 1 : 0
                      }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // elegant ease out
                    >
                      <p className="text-gray-600 text-lg md:text-xl max-w-2xl font-light leading-relaxed pt-6">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 mt-8">
                        {post.targetKeywords.slice(0, 2).map((kw, i) => (
                          <span key={i} className="text-[10px] tracking-[0.2em] uppercase text-gray-500 border border-gray-300 px-4 py-2 rounded-full">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Read Time & Floating Icon */}
                  <div className="lg:w-1/5 flex items-center lg:justify-end gap-6 pt-4 lg:pt-2">
                    <span className="text-gray-500 text-xs uppercase tracking-[0.2em]">
                      {post.readTime}
                    </span>
                    <span className="text-gray-400 group-hover:text-[#D4AF37] transition-colors duration-500 transform group-hover:translate-x-3">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}