"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { 
  BookOpen, Baby, Mic, Brain, Users, Sparkles, 
  MessageCircle, ArrowRight, ShieldCheck, CheckCircle2,
  Phone
} from "lucide-react";

export default function CoursesPage() {
  const academyCourses = [
    {
      id: "basic-reading",
      title: "Noorani Qaida Foundation",
      duration: "3-6 Months",
      level: "Beginner",
      desc: "The essential first step for beginners. Our tutors patiently guide students through the Qaida, ensuring they recognize and pronounce Arabic words with an authentic accent.",
      features: ["Arabic Alphabets Recognition", "Harakaat & Tanween", "Basic Tajweed Rules", "Perfect Pronunciation"],
      icon: BookOpen,
    },
    {
      id: "kids-courses",
      title: "Quran Courses for Kids",
      duration: "Ongoing",
      level: "Beginner",
      desc: "We understand that keeping children engaged requires a special touch. We provide 1-on-1, interactive classes tailored for short attention spans.",
      features: ["Gentle & Engaging Approach", "Interactive Digital Tools", "Flexible Scheduling", "Progress Tracking"],
      icon: Baby,
    },
    {
      id: "tajweed",
      title: "Reading with Tajweed",
      duration: "Ongoing",
      level: "Intermediate",
      desc: "Read the Holy Quran with absolute accuracy. This course focuses on the beautiful articulation of words and strict adherence to the rules of Tajweed.",
      features: ["Advanced Makharij", "Rules of Waqf (Stopping)", "Sifaat of Letters", "Melodic Recitation"],
      icon: Mic,
    },
    {
      id: "memorization",
      title: "Quran Memorization (Hifz)",
      duration: "2-4 Years",
      level: "Advanced",
      desc: "A structured, deeply rewarding online Hifz service for dedicated students. Includes daily new lessons, recent revisions, and old revisions under expert supervision.",
      features: ["Personalized Retention Plans", "Daily Recitation Tracking", "Memory Optimization", "Certification upon Completion"],
      icon: Brain,
    },
    {
      id: "female-courses",
      title: "Courses for Females",
      duration: "Flexible",
      level: "All Levels",
      desc: "For sisters and daughters seeking a comfortable learning environment, we offer dedicated, private sessions guided by our highly qualified female scholars.",
      features: ["100% Privacy Ensured", "Certified Female Scholars", "Comfortable Environment", "Tailored Learning Pace"],
      icon: Users,
    },
    {
      id: "islamic-concepts",
      title: "Islamic Studies & Concepts",
      duration: "Ongoing",
      level: "All Levels",
      desc: "Beyond recitation, we teach the core values of Islam. From basic Aqeedah and daily Duas to Islamic manners, we help nurture a well-rounded Islamic identity.",
      features: ["Daily Sunnahs & Duas", "Stories of the Prophets", "Basic Fiqh (Wudu, Salah)", "Character Building"],
      icon: Sparkles,
    },
    {
      id: "learn-urdu",
      title: "Learn Urdu",
      duration: "3-6 Months",
      level: "Beg. to Intermediate",
      desc: "Join us to learn the Urdu language in a relaxed atmosphere. We help children living abroad connect with their cultural heritage through conversation and reading.",
      features: ["Conversational Speaking", "Listening Exercises", "Cultural Heritage", "Basic Reading & Writing"],
      icon: MessageCircle,
    }
  ];

  return (
    <>
      <Navbar />
      <main className="relative w-full min-h-screen bg-[#F9F9F9] text-gray-900 pt-32 pb-0 font-sans overflow-x-hidden selection:bg-[#0F5132] selection:text-white">
        
        {/* --- PREMIUM AMBIENT GLOWS --- */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/10 blur-[120px] rounded-full z-0 pointer-events-none" />
        <div className="absolute top-[30%] left-[-10%] w-[800px] h-[800px] bg-[#0F5132]/5 blur-[120px] rounded-full z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* --- HERO SECTION --- */}
          <section className="text-center max-w-4xl mx-auto mb-32">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-3 justify-center mb-8">
                <span className="w-10 h-[2px] bg-[#D4AF37]" />
                <span className="text-[#0F5132] text-xs font-black uppercase tracking-[0.3em]">Explore Programs</span>
                <span className="w-10 h-[2px] bg-[#D4AF37]" />
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-gray-900 leading-[1.1] tracking-tight mb-8">
                Our Academic <br />
                <span className="italic font-light text-[#D4AF37]">Curriculum</span>
              </h1>
              
              <p className="text-xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto mt-8">
                From absolute beginners learning the Arabic alphabet to advanced students mastering Hifz, our structured programs are tailored to your family's unique pace and ability.
              </p>
            </motion.div>
          </section>

          {/* --- EMOTIONAL ORIGIN STORY (EDITORIAL BLOCKQUOTE) --- */}
          <div className="max-w-4xl mx-auto mb-32 relative py-16 border-y border-[#0F5132]/10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-12 relative z-10"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 tracking-tight leading-tight">
                A Journey From Our Heart <br />
                <span className="text-[#0F5132] italic font-light">To Your Home</span>
              </h2>
              
              <div className="space-y-8 text-xl text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
                <p>
                  Many families living abroad in the US, UK, and Australia carry a silent worry in their hearts: <em className="text-[#0F5132] font-serif tracking-tight text-2xl">"How do we connect our children to the beauty of the Quran when we are so far from home?"</em>
                </p>
                <p>
                  Learn Quran Academy wasn’t born in a corporate boardroom. It was born from conversations with parents who were tired of rigid schedules and impersonal apps. They simply wanted a patient, loving, and deeply experienced teacher for their kids.
                </p>
                <p className="border-l-2 border-[#D4AF37] pl-8 text-left italic">
                  Today, with a team of certified instructors, we bridge that global gap. We bring the warmth, patience, and profound wisdom of traditional Quranic education directly into your living room.
                </p>
              </div>
            </motion.div>
          </div>

          {/* --- TRANSPARENT PRICING & LOGISTICS BLOCK (NO CARDS) --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto mb-32 border-t border-[#0F5132]/10 pt-16"
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <span className="text-[#D4AF37] font-black uppercase tracking-[0.2em] text-[10px]">
                  Simple, Honest Tuition
                </span>
                <h3 className="text-4xl md:text-5xl font-serif text-gray-900 leading-[1.1] tracking-tight">
                  Everything you need, <br />
                  <span className="italic font-light text-[#0F5132]">no hidden fees.</span>
                </h3>
                <p className="text-gray-600 font-light text-lg max-w-md leading-relaxed">
                  We believe Islamic education should be accessible, high-quality, and completely stress-free for parents.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-16">
                <div>
                  <div className="text-5xl font-serif text-[#0F5132] mb-3">$30</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Per Month / Course</div>
                </div>
                <div>
                  <div className="text-5xl font-serif text-gray-900 mb-3">4</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Classes A Week</div>
                </div>
                <div>
                  <div className="text-5xl font-serif text-[#D4AF37] mb-3">30</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Minute Sessions</div>
                </div>
                <div>
                  <div className="text-3xl font-serif text-gray-900 mb-3 leading-tight mt-3">Flexible</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Missed class? Rescheduled.</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* --- ACADEMIC CURRICULUM (EDITORIAL LIST) --- */}
          <div className="mb-32">
            <div className="text-center mb-24">
              <span className="text-[#0F5132] font-black tracking-[0.2em] uppercase text-xs mb-4 block">
                Pathways
              </span>
              <h2 className="text-4xl md:text-6xl font-serif text-gray-900 tracking-tight">Our Academic Programs</h2>
            </div>

            <div className="max-w-5xl mx-auto flex flex-col border-t border-[#0F5132]/10">
              {academyCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
                  className="group relative flex flex-col md:flex-row py-16 border-b border-[#0F5132]/10 gap-12 lg:gap-24 items-start"
                >
                  {/* Left: Icon & Meta */}
                  <div className="md:w-1/3 shrink-0">
                    <div className="w-16 h-16 border border-[#D4AF37]/50 rounded-full flex items-center justify-center mb-8 group-hover:bg-[#0F5132] group-hover:border-[#0F5132] transition-colors duration-500">
                      <course.icon className="w-6 h-6 text-[#0F5132] group-hover:text-white transition-colors duration-500" />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Duration</span>
                        <p className="text-sm font-medium text-gray-900 mt-1">{course.duration}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Level</span>
                        <p className="text-sm font-medium text-[#0F5132] mt-1">{course.level}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Content */}
                  <div className="md:w-2/3 space-y-8">
                    <h3 className="text-3xl md:text-4xl font-serif text-gray-900 leading-[1.1] tracking-tight group-hover:text-[#0F5132] transition-colors duration-500">
                      {course.title}
                    </h3>
                    <p className="text-lg text-gray-600 font-light leading-relaxed">
                      {course.desc}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      {course.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-sm font-medium text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-8">
                      <Link 
                        href={`/register?course=${course.id}`}
                        className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-[#0F5132] hover:text-[#D4AF37] transition-colors group-hover:gap-6"
                      >
                        Enroll in this course 
                        <ArrowRight className="w-4 h-4 transition-all" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* --- CUSTOM PLAN / CONTACT CTA (EDITORIAL BANNER) --- */}
        <section className="bg-[#0F5132] relative overflow-hidden py-32 px-6">
           <div className="absolute inset-0 bg-[url('/islamic-pattern.png')] opacity-5 mix-blend-overlay pointer-events-none" />
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
           
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="relative z-10 max-w-4xl mx-auto text-center"
           >
              <h2 className="text-4xl md:text-6xl font-serif text-white mb-8 tracking-tight leading-tight">
                Need a Customized <br className="hidden md:block" />
                <span className="italic font-light text-[#D4AF37]">Learning Plan?</span>
              </h2>
              <p className="text-white/80 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed mb-12">
                We offer tailored schedules and specialized curriculum combinations for adults, revert Muslims, and large families. Have questions? Reach out to our support team.
              </p>
              
              <div className="flex flex-wrap justify-center gap-6">
                <Link 
                  href="/contact" 
                  className="group inline-flex items-center justify-center px-10 py-5 bg-white text-[#0F5132] font-black uppercase tracking-[0.2em] text-xs transition-transform hover:-translate-y-1"
                >
                  <span className="flex items-center gap-3">
                    Contact Support
                  </span>
                </Link>
                <a 
                  href="https://wa.me/923046263947" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group inline-flex items-center justify-center px-10 py-5 bg-transparent border border-[#D4AF37] text-[#D4AF37] font-black uppercase tracking-[0.2em] text-xs transition-colors hover:bg-[#D4AF37] hover:text-[#0F5132]"
                >
                  <span className="flex items-center gap-3">
                    <Phone className="w-4 h-4" /> Message on WhatsApp
                  </span>
                </a>
              </div>
           </motion.div>
        </section>

      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}