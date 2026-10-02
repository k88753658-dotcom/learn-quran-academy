"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CoursesAndStoryPage() {
  // Course data meticulously mapped from the provided visual layout
  const academyCourses = [
    {
      id: "basic-reading",
      title: "Basic Quran Reading",
      subtitle: "The Perfect Foundation",
      description: "Established for beginners and young learners. Our highly qualified tutors patiently guide students through the Noorani Qaida, ensuring they learn to recognize and pronounce Arabic words with a perfect, authentic accent.",
      icon: "📖", 
      color: "bg-[#7A9D8C]" // Soft Sage Green
    },
    {
      id: "kids-courses",
      title: "Quran Courses for Kids",
      subtitle: "Gentle & Engaging",
      description: "We understand that keeping children engaged online requires a special touch. We provide 1-on-1, interactive classes tailored for short attention spans, allowing you to choose the schedule that best fits your home.",
      icon: "🧸",
      color: "bg-[#C5A880]" // Muted Gold/Sand
    },
    {
      id: "memorization",
      title: "Quran Memorization",
      subtitle: "The Noble Hifz Journey",
      description: "Millions of Muslim parents dream of their children memorizing the Quran, but struggle to find skilled tutors abroad. We offer a structured, deeply rewarding online Hifz service under the careful supervision of expert instructors.",
      icon: "🕌",
      color: "bg-[#4A3C31]" // Deep Espresso Brown
    },
    {
      id: "female-courses",
      title: "Courses for Females",
      subtitle: "Comfort & Privacy",
      description: "For sisters and daughters seeking a comfortable learning environment, we offer dedicated, private sessions guided by our highly qualified and experienced female scholars.",
      icon: "🧕",
      color: "bg-[#7A9D8C]"
    },
    {
      id: "islamic-concepts",
      title: "Learn Islamic Concepts",
      subtitle: "Faith in Daily Life",
      description: "Beyond recitation, we teach the beautiful core values of Islam. From basic Aqeedah and daily Duas to understanding the submission to One God, we help nurture a well-rounded Islamic identity.",
      icon: "✨",
      color: "bg-[#C5A880]"
    },
    {
      id: "learn-urdu",
      title: "Learn Urdu",
      subtitle: "Connect with Your Roots",
      description: "Come and join us to learn the Urdu language in a relaxed atmosphere. We help children living abroad connect with their cultural heritage through conversational speaking and listening exercises.",
      icon: "📝",
      color: "bg-[#4A3C31]"
    }
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF7F2] text-[#4A3C31] pt-32 pb-24 relative overflow-hidden font-sans">
        
        {/* Organic Background Elements */}
        <div className="absolute top-0 right-0 w-200 h-200 bg-[#C5A880]/5 blur-30 rounded-full z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-150 h-150 bg-[#7A9D8C]/5 blur-25 rounded-full z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* --- EMOTIONAL ORIGIN STORY (THE "WHY") --- */}
          <div className="max-w-4xl mx-auto mb-32">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                A Journey From Our Heart <br className="hidden md:block" />
                <span className="text-[#C5A880]">To Your Home</span>
              </h1>
              
              <div className="w-24 h-1 bg-[#7A9D8C] mx-auto rounded-full opacity-50 my-8" />
              
              <div className="space-y-6 text-lg text-gray-600 font-medium leading-relaxed px-4 md:px-12">
                <p>
                  It started with a simple realization. Many families living abroad in the US, UK, and Australia carry a silent worry in their hearts: <em className="text-[#4A3C31]">"How do we connect our children to the beauty of the Quran when we are so far from home?"</em>
                </p>
                <p>
                  Learn Quran Academy wasn’t born in a corporate boardroom. It was born from conversations with parents who were tired of rigid schedules and impersonal apps. They simply wanted a patient, loving, and deeply experienced teacher for their kids.
                </p>
                <p>
                  Today, with a team of certified instructors—each bringing over 5 years of dedicated teaching experience—we bridge that global gap. We bring the warmth, patience, and profound wisdom of traditional Quranic education directly into your living room.
                </p>
              </div>
            </motion.div>
          </div>

          {/* --- TRANSPARENT PRICING & LOGISTICS BLOCK --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto bg-white rounded-4xl p-8 md:p-12 shadow-[0_20px_50px_-20px_rgba(74,60,49,0.1)] border border-[#C5A880]/20 mb-32 flex flex-col md:flex-row items-center justify-between gap-10"
          >
            <div className="flex-1 space-y-4">
              <span className="text-[#7A9D8C] font-black uppercase tracking-widest text-xs bg-[#7A9D8C]/10 px-4 py-2 rounded-full">
                Simple, Honest Tuition
              </span>
              <h3 className="text-3xl font-black text-[#4A3C31]">Everything you need, <br />no hidden fees.</h3>
              <p className="text-gray-500 font-medium">We believe Islamic education should be accessible and stress-free for parents.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-8 flex-1 w-full">
              <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#C5A880]/10">
                <div className="text-3xl font-black text-[#C5A880] mb-1">$30</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Per Month / Course</div>
              </div>
              <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#C5A880]/10">
                <div className="text-3xl font-black text-[#C5A880] mb-1">4</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Classes A Week</div>
              </div>
              <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#C5A880]/10">
                <div className="text-3xl font-black text-[#C5A880] mb-1">30</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Minute Sessions</div>
              </div>
              <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#C5A880]/10">
                <div className="text-lg font-black text-[#7A9D8C] mb-2 leading-tight">Always<br/>Rescheduled</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">If you miss a class</div>
              </div>
            </div>
          </motion.div>

          {/* --- ACADEMIC CURRICULUM GRID --- */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#4A3C31]">Our Academic Programs</h2>
            <p className="text-gray-500 mt-4 font-medium">Select a path tailored to your family's needs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
            {academyCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-[#C5A880]/20 hover:shadow-2xl hover:shadow-[#C5A880]/10 transition-all duration-300 flex flex-col h-full group"
              >
                <div className={`w-16 h-16 rounded-2xl ${course.color} text-white flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {course.icon}
                </div>
                
                <h3 className="text-2xl font-black text-[#4A3C31] mb-1">{course.title}</h3>
                <p className="text-[#C5A880] text-xs font-bold uppercase tracking-widest mb-4">{course.subtitle}</p>
                
                <p className="text-gray-500 text-sm leading-relaxed flex-1 font-medium">
                  {course.description}
                </p>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <Link href="/register" className="flex items-center gap-2 text-sm font-black text-[#7A9D8C] uppercase tracking-widest group-hover:gap-4 transition-all">
                    Register Your Child
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* --- WARM FOOTER / CONTACT TIE-IN --- */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center space-y-8 bg-[#4A3C31] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/islamic-pattern.png')] opacity-5 bg-repeat mix-blend-overlay" />
            <h2 className="text-3xl font-black relative z-10">We are here to assist you.</h2>
            <p className="text-[#C5A880] font-medium relative z-10 max-w-xl mx-auto">
              Have questions before enrolling? Our support team is ready to help via phone, WhatsApp, or email. Follow our journey on social media.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 relative z-10 pt-4">
              <Link href="/contact" className="bg-white text-[#4A3C31] px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#FAF7F2] transition-colors">
                Contact Support
              </Link>
              <a href="https://www.instagram.com/learnquranacademy_/" target="_blank" rel="noreferrer" className="bg-[#C5A880] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#b3956b] transition-colors">
                Instagram
              </a>
              <a href="https://www.facebook.com/profile.php?id=61581303761340" target="_blank" rel="noreferrer" className="bg-[#7A9D8C] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#668676] transition-colors">
                Facebook
              </a>
            </div>
          </motion.div>

        </div>
      </main>
      <Footer />
    </>
  );
}