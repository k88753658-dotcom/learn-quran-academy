"use client";
import React from "react";
import Link from "next/link"; // Included safely to prevent route errors
import { academyTeachers } from "@/lib/teacherData";
import ScrollReveal from "@/components/ScrollReveal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function TeachersPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FDFCF0] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <h1 className="text-5xl font-extrabold text-[#5C4033] mb-4">Our Qualified Faculty</h1>
              <p className="text-gray-600 max-w-xl mx-auto">
                Every teacher holds traditional verification and certifications to offer flawless pedagogical tracking.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10">
            {academyTeachers.map((teacher) => (
              <ScrollReveal key={teacher.id}>
                <div className="bg-white p-8 md:p-10 rounded-3xl border border-[#D2B48C]/20 shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[#50C878] text-xs font-bold tracking-widest uppercase block mb-2">
                      Verified Faculty
                    </span>
                    <h2 className="text-3xl font-bold text-[#5C4033] mb-1">{teacher.name}</h2>
                    <span className="text-[#D4AF37] text-sm font-semibold block mb-4">{teacher.role}</span>
                    <div className="bg-[#FDFCF0] p-4 rounded-xl border border-dashed border-[#D2B48C]/30 text-xs text-gray-600 mb-6">
                      📍 {teacher.credentials}
                    </div>
                    <p className="text-gray-600 leading-relaxed text-base">{teacher.bio}</p>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <Link href="/register">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full md:w-auto bg-[#5C4033] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md"
                      >
                        Book Trial with This Teacher
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}