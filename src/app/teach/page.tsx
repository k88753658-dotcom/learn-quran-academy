"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, GraduationCap, Briefcase, Globe, Info } from "lucide-react";

const qualificationsList = [
  "Ijazah in Quran/Tajweed",
  "Hafiz-e-Quran",
  "Alim/Alimah Course",
  "Bachelor's in Islamic Studies",
  "Master's in Islamic Studies",
  "Other"
];

export default function TeachPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [specializationsList, setSpecializationsList] = useState<string[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        if (data.success && data.courses) {
          setSpecializationsList(data.courses.map((c: any) => c.title));
        }
      } catch (e) {
        console.error("Failed to fetch courses:", e);
      }
    };
    fetchCourses();
  }, []);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    country: "",
    qualification: "",
    experienceYears: "",
    bio: "",
  });

  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSpecToggle = (spec: string) => {
    setSelectedSpecs(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSpecs.length === 0) {
      setStatus("error");
      setErrorMessage("Please select at least one specialization.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/teacher-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, specializations: selectedSpecs })
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to submit application.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex font-sans selection:bg-[#0F5132] selection:text-white">
      
      {/* ===== LEFT PANEL ===== */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0F5132] relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.5) 35px, rgba(255,255,255,0.5) 36px)`,
        }} />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-white/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-serif italic text-xl tracking-tight">
              LQ
            </div>
            <span className="text-white/80 text-sm font-light tracking-[0.2em] uppercase group-hover:text-white transition-colors">Learn Quran Academy</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="text-[#D4AF37]/40 font-serif text-8xl leading-none">"</div>
          <h2 className="text-4xl xl:text-5xl font-serif text-white leading-[1.2] tracking-tight -mt-8">
            The best among <br />you are those who <br />
            <span className="text-[#D4AF37] italic">learn the Quran and teach it.</span>
          </h2>
          <div className="flex items-center gap-4 mt-8">
            <div className="w-12 h-[1px] bg-[#D4AF37]/50" />
            <p className="text-white/50 text-sm font-light tracking-widest uppercase">Sahih Al-Bukhari</p>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-6 text-white/80 font-light">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Global Reach</p>
              <p className="text-xs text-white/60 mt-1">Teach students from over 15 countries from the comfort of your home.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Professional Environment</p>
              <p className="text-xs text-white/60 mt-1">Dedicated teacher portals, automated billing, and structured syllabus.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div className="w-full lg:w-[55%] bg-[#F9F9F9] flex flex-col items-center justify-center px-6 py-12 lg:py-16 relative overflow-y-auto">
        <div className="w-full max-w-xl relative z-10">
          
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0F5132] flex items-center justify-center text-[#D4AF37] font-serif italic text-lg">LQ</div>
            </Link>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-[1px] bg-[#D4AF37]" />
                <span className="text-[#0F5132] text-[10px] font-black uppercase tracking-[0.3em]">Careers</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-serif text-gray-900 tracking-tight mb-3">
                Become an <span className="text-[#D4AF37] italic">Instructor</span>
              </h1>
              <p className="text-gray-500 font-light text-sm md:text-base">
                Join our esteemed faculty and help spread the light of the Quran worldwide.
              </p>
            </div>

            {status === "success" ? (
              <div className="bg-white border border-[#0F5132]/10 p-10 text-center">
                <div className="w-20 h-20 bg-[#0F5132]/5 text-[#0F5132] rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif text-gray-900 mb-3">Application Received!</h3>
                <p className="text-gray-600 font-light text-sm leading-relaxed mb-8">
                  Jazakallah Khair for applying. Our administration team will review your application carefully. 
                  If your profile matches our requirements, you will receive an email with your dashboard login credentials.
                </p>
                <Link href="/" className="inline-block bg-[#0F5132] text-white px-8 py-4 font-black uppercase tracking-[0.2em] text-xs hover:bg-[#D4AF37] hover:text-[#0F5132] transition-colors">
                  Return Home
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-10 border border-gray-100 shadow-sm">
                
                {status === "error" && (
                  <div className="bg-red-50 border-l-4 border-red-600 text-red-800 px-5 py-4 text-sm font-light flex items-start gap-3">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                {/* Section 1: Personal Info */}
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0F5132] border-b border-gray-100 pb-3 mb-6">1. Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Full Name *</label>
                      <input name="name" value={formData.name} onChange={handleChange} required type="text" className="w-full bg-[#F9F9F9] border border-gray-200 p-3 text-sm text-gray-900 focus:outline-none focus:border-[#0F5132] transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Email Address *</label>
                      <input name="email" value={formData.email} onChange={handleChange} required type="email" className="w-full bg-[#F9F9F9] border border-gray-200 p-3 text-sm text-gray-900 focus:outline-none focus:border-[#0F5132] transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">WhatsApp Number *</label>
                      <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} required type="tel" placeholder="+1234567890" className="w-full bg-[#F9F9F9] border border-gray-200 p-3 text-sm text-gray-900 focus:outline-none focus:border-[#0F5132] transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Country of Residence</label>
                      <input name="country" value={formData.country} onChange={handleChange} type="text" className="w-full bg-[#F9F9F9] border border-gray-200 p-3 text-sm text-gray-900 focus:outline-none focus:border-[#0F5132] transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Section 2: Professional Info */}
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0F5132] border-b border-gray-100 pb-3 mb-6">2. Professional Background</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Highest Qualification *</label>
                      <select name="qualification" value={formData.qualification} onChange={handleChange} required className="w-full bg-[#F9F9F9] border border-gray-200 p-3 text-sm text-gray-900 focus:outline-none focus:border-[#0F5132] transition-colors">
                        <option value="">Select Qualification</option>
                        {qualificationsList.map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Years of Experience</label>
                      <input name="experienceYears" value={formData.experienceYears} onChange={handleChange} type="number" min="0" className="w-full bg-[#F9F9F9] border border-gray-200 p-3 text-sm text-gray-900 focus:outline-none focus:border-[#0F5132] transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Specializations (Select all that apply) *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {specializationsList.map(spec => (
                        <label key={spec} className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${selectedSpecs.includes(spec) ? 'border-[#0F5132] bg-[#0F5132]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <input 
                            type="checkbox" 
                            checked={selectedSpecs.includes(spec)}
                            onChange={() => handleSpecToggle(spec)}
                            className="w-4 h-4 text-[#0F5132] focus:ring-[#0F5132] border-gray-300"
                          />
                          <span className="text-xs text-gray-700 font-bold">{spec}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Short Bio / Introduction</label>
                    <textarea 
                      name="bio" 
                      value={formData.bio} 
                      onChange={handleChange} 
                      rows={4}
                      placeholder="Tell us about your teaching methodology and background..."
                      className="w-full bg-[#F9F9F9] border border-gray-200 p-3 text-sm text-gray-900 focus:outline-none focus:border-[#0F5132] transition-colors resize-none" 
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={status === "submitting"}
                    type="submit" 
                    className="w-full bg-[#0F5132] text-white px-8 py-5 font-black uppercase tracking-[0.2em] text-xs hover:bg-[#D4AF37] hover:text-[#0F5132] transition-colors disabled:opacity-70 flex justify-center items-center gap-3"
                  >
                    {status === "submitting" ? (
                      <span className="animate-pulse">Submitting Application...</span>
                    ) : (
                      <>Submit Application</>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="text-center mt-10">
              <Link href="/" className="text-xs font-light text-gray-400 hover:text-[#0F5132] transition-colors tracking-widest uppercase">
                ← Back to Homepage
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
