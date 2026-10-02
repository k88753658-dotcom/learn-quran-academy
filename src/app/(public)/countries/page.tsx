"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CountriesPage() {
  // Data for the country grid
  const countries = [
    { name: "United Kingdom", image: "/images/uk.jpg", desc: "Expert Tajweed & Hifz tutors available in GMT timezones." },
    { name: "United States", image: "/images/usa.jpg", desc: "Flexible scheduling for EST, CST, and PST families." },
    { name: "Australia", image: "/images/australia.jpg", desc: "Dedicated instructors for Sydney, Melbourne, and beyond." },
    { name: "Canada", image: "/images/canada.jpg", desc: "Connecting Canadian Muslims to authentic Quranic education." },
    { name: "United Arab Emirates", image: "/images/uae.jpg", desc: "Premium Arabic and Qaida foundations for expat families." },
    { name: "Europe", image: "/images/europe.jpg", desc: "Accessible Islamic education across all European nations." },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF7F2] text-[#4A3C31] pt-24 pb-20 font-sans">
        
        {/* --- HERO SECTION WITH BACKGROUND IMAGE --- */}
        <section className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Placeholder Background Image
            Once you download a global/world image, save it as 'global-hero.jpg' in public/images/ 
          */}
          <div className="absolute inset-0 bg-[#4A3C31]">
            { <Image 
                src="/images/global-hero.jpg" 
                alt="Global Quran Academy" 
                fill 
                className="object-cover opacity-40 mix-blend-overlay"
                priority
              /> 
            }
            <div className="absolute inset-0 bg-linear-to-t from-[#4A3C31] via-transparent to-[#4A3C31]/50" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center px-6 max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
              Your Trusted Global <br /> Online Quran Academy
            </h1>
            <p className="text-[#C5A880] text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md">
              Connecting students across the globe with expert Quran tutors for Tajweed, Hifz, Qaida, and Arabic learning.
            </p>
          </motion.div>
        </section>

        {/* --- INTRODUCTION TEXT --- */}
        <section className="py-20 px-6 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-[#7A9D8C] mb-6">
              Worldwide Access to Qualified Quran Teachers
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed font-medium">
              No matter where you live, our academy provides easy access to qualified Quran teachers with flexible scheduling and one-on-one online sessions. Students from different countries can learn the Quran with proper Tajweed, Hifz, and Arabic guidance in a comfortable and personalized environment.
            </p>
          </motion.div>
        </section>

        {/* --- COUNTRIES IMAGE GRID --- */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {countries.map((country, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative h-80 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                {/* Fallback Background Color (Visible until you add images) 
                  Remove the bg-[#7A9D8C] once images are working perfectly 
                */}
                <div className="absolute inset-0 bg-[#7A9D8C]">
                  {/* <Image 
                      src={country.image} 
                      alt={`Learn Quran in ${country.name}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    /> 
                  */}
                </div>
                
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-linear-to-t from-[#4A3C31] via-[#4A3C31]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Text Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-2xl font-black text-white mb-2">{country.name}</h3>
                  <p className="text-[#C5A880] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    {country.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- BOTTOM CALL TO ACTION --- */}
        <section className="max-w-4xl mx-auto px-6 text-center">
           <div className="bg-[#4A3C31] rounded-[3rem] p-12 md:p-16 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/islamic-pattern.png')] opacity-5 bg-repeat mix-blend-overlay" />
              <h2 className="text-3xl md:text-4xl font-black mb-6 relative z-10">Start Your Journey Today</h2>
              <p className="text-[#C5A880] mb-8 relative z-10 font-medium">Join our global family with a 3-Day Free Trial.</p>
              <Link href="/register" className="inline-block relative z-10 bg-white text-[#4A3C31] px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-[#FAF7F2] transition-colors">
                Apply Online
              </Link>
           </div>
        </section>

      </main>
      <Footer />
    </>
  );
}