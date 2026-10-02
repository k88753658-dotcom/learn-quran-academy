"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function TeachersSection() {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("/api/public-teachers");
        const data = await res.json();
        if (data.success && data.teachers) {
          setInstructors(data.teachers);
        }
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const fallbackInstructors = [
    {
      id: "fallback-1",
      name: "Qari Muhammad Yusuf",
      role: "Senior Tajweed Specialist",
      qualification: "Shahadat-ul-Alamiya & Al-Azhar Certified",
      specializations: ["Phonetic Articulation", "Vocal Mechanics"],
    },
    {
      id: "fallback-2",
      name: "Ustadh Ahmed Al-Sayed",
      role: "Foundational Syllabus Lead",
      qualification: "B.A. in Islamic Studies & Ijazah Holder",
      specializations: ["Noorani Qaida", "Youth Instruction"],
    },
    {
      id: "fallback-3",
      name: "Ustadha Fatima Al-Zahra",
      role: "Quran Memorization Coach",
      qualification: "Hafiza-ul-Quran & Tajweed Scholar",
      specializations: ["Advanced Retention", "Precision Review"],
    }
  ];

  const displayInstructors = instructors.length > 0 ? instructors : fallbackInstructors;

  return (
    <section className="py-16 md:py-24 bg-[#F9F9F9] relative w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background large decorative text */}
      <div className="absolute top-0 left-0 w-full flex justify-center pointer-events-none opacity-5 select-none">
        <span className="text-[20vw] font-serif text-[#0F5132] whitespace-nowrap leading-none mt-10">
          FACULTY
        </span>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-32">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif text-[#0F5132] mb-6 tracking-wide"
          >
            Master Teachers
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm md:text-base font-semibold"
          >
            Custodians of the Sacred Text
          </motion.p>
        </div>

        {/* Instructors */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-24 lg:gap-16 xl:gap-24">
          {displayInstructors.map((teacher, index) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="flex flex-col items-center text-center max-w-sm group"
            >
              {/* Floating Circular Headshot */}
              <div className="relative w-56 h-56 mb-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-white rounded-full scale-100 group-hover:scale-105 transition-transform duration-700 ease-out shadow-2xl" />
                <div className="absolute inset-2 border border-[#D4AF37]/30 rounded-full" />
                <span className="relative z-10 text-7xl font-serif text-[#D4AF37] opacity-80 group-hover:text-[#0F5132] transition-colors duration-700 font-light">
                  {teacher.name.split(' ').filter((n: string) => n !== "Qari" && n !== "Ustadh" && n !== "Ustadha")[0]?.charAt(0) || "Q"}
                </span>
              </div>

              {/* Name & Role */}
              <h3 className="text-3xl font-serif text-[#0F5132] mb-3 tracking-wide">
                {teacher.name}
              </h3>
              <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-10 font-semibold">
                Senior Instructor
              </p>

              {/* Details (using negative space) */}
              <div className="space-y-6">
                <div>
                  <p className="text-[#115E59]/60 text-[10px] uppercase tracking-widest mb-2 font-bold">
                    Qualifications
                  </p>
                  <p className="text-gray-700 font-light text-sm max-w-[250px] mx-auto leading-relaxed">
                    {teacher.qualification || "Certified Scholar"}
                  </p>
                </div>
                <div>
                  <p className="text-[#115E59]/60 text-[10px] uppercase tracking-widest mb-2 font-bold">
                    Expertise
                  </p>
                  <p className="text-gray-700 font-light text-sm max-w-[250px] mx-auto leading-relaxed">
                    {teacher.specializations?.join(', ') || "Quran Instruction"}
                  </p>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}