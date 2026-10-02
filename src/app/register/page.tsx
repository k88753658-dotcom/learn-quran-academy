"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import {
  Eye, EyeOff, CheckCircle2,
  MessageSquare, Wallet, ArrowRight, Copy
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function RegisterPage() {
  const router = useRouter();

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        if (data.success && data.courses) {
          setCourses(data.courses);
        }
      } catch (e) {
        console.error("Failed to fetch courses:", e);
      }
    };
    fetchCourses();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    parentName: "",
    email: "",
    whatsappNumber: "",
    country: "",
    password: "",
    studentName: "",
    studentAge: "",
    selectedCourse: "",
    specialRequirements: "",
    role: "student",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "studentName" && !prev.name) {
        updated.name = value;
      }
      return updated;
    });
  };

  const copyNayaPay = () => {
    navigator.clipboard.writeText("+92 3006024699");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const displayName = (formData.studentName || formData.name || formData.parentName).trim();
      const { data, error } = await authClient.signUp.email({
        email: formData.email.trim(),
        password: formData.password,
        name: displayName,
        callbackURL: "/dashboard",
      });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message || "Registration failed. Please try again.");
        return;
      }

      // Synchronize additional student registration metadata
      try {
        await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            name: displayName,
          }),
        });
      } catch (metadataErr) {
        console.warn("Non-blocking registration metadata sync error:", metadataErr);
      }

      setStatus("success");
    } catch (err: any) {
      console.error("Registration Error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Network error. Please check your internet connection.");
    }
  };

  return (
    <main className="min-h-screen flex font-sans selection:bg-[#0F5132] selection:text-white">
      
      {/* ===== LEFT PANEL: BRANDING ===== */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#0F5132] relative flex-col justify-between p-16 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.5) 35px, rgba(255,255,255,0.5) 36px)`,
        }} />
        
        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-white/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-serif italic text-xl tracking-tight">
              LQ
            </div>
            <span className="text-white/80 text-sm font-light tracking-[0.2em] uppercase group-hover:text-white transition-colors">Learn Quran Academy</span>
          </Link>
        </div>

        {/* Center: Big serif quote */}
        <div className="relative z-10 space-y-6">
          <div className="text-[#D4AF37]/40 font-serif text-8xl leading-none">"</div>
          <h2 className="text-3xl xl:text-4xl font-serif text-white leading-[1.2] tracking-tight -mt-6">
            The best among you are <br />those who learn the <br />
            <span className="text-[#D4AF37] italic">Quran and teach it.</span>
          </h2>
          <div className="flex items-center gap-4 mt-6">
            <div className="w-12 h-[1px] bg-[#D4AF37]/50" />
            <p className="text-white/50 text-sm font-light tracking-widest uppercase">Sahih al-Bukhari</p>
          </div>
        </div>

        {/* Bottom: Trust indicators */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 border border-[#D4AF37]/30 rounded-full flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5">
              <span className="text-xs">✓</span>
            </div>
            <div>
              <p className="text-white/90 font-medium text-sm">No Commitment Required</p>
              <p className="text-white/40 text-xs font-light mt-1">You will not be billed unless you continue after the 3-day trial.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 border border-[#D4AF37]/30 rounded-full flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5">
              <span className="text-xs">✓</span>
            </div>
            <div>
              <p className="text-white/90 font-medium text-sm">Family Discounts Available</p>
              <p className="text-white/40 text-xs font-light mt-1">Special discounted rates for siblings enrolling together.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL: FORM ===== */}
      <div className="w-full lg:w-[60%] bg-[#F9F9F9] flex items-start justify-center px-6 py-12 lg:py-16 relative overflow-y-auto">
        {/* Subtle ambient glow */}
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-2xl relative z-10">
          
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0F5132] flex items-center justify-center text-[#D4AF37] font-serif italic text-lg">
                LQ
              </div>
              <span className="text-gray-900 text-sm font-light tracking-[0.2em] uppercase">Learn Quran Academy</span>
            </Link>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-[1px] bg-[#D4AF37]" />
                <span className="text-[#0F5132] text-[10px] font-black uppercase tracking-[0.3em]">Begin Your Journey</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tight mb-3">
                Start your <span className="text-[#D4AF37] italic">Free Trial</span>
              </h1>
              <p className="text-gray-500 font-light text-lg">
                Sign up for a 3-day evaluation class — completely risk-free.
              </p>
            </div>

            {status === "success" ? (
              /* ===== SUCCESS SCREEN ===== */
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-[#0F5132]/10 text-[#0F5132] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#0F5132]/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-serif text-gray-900 mb-3">JazakAllah Khair, {formData.parentName.split(' ')[0] || formData.name.split(' ')[0] || "Student"}!</h2>
                  <p className="text-gray-500 font-light text-lg">Your 3-day free trial application has been securely received.</p>
                </div>

                <div className="bg-white p-8 border border-[#0F5132]/10 space-y-8 relative">
                  <div className="absolute inset-0 border border-[#D4AF37] translate-x-2 translate-y-2 pointer-events-none" />
                  
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] relative z-10">What happens next?</h3>
                  
                  <div className="flex gap-5 items-start relative z-10">
                    <div className="w-10 h-10 border border-[#0F5132]/20 rounded-full flex items-center justify-center text-[#0F5132] shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">WhatsApp Outreach</h4>
                      <p className="text-gray-500 font-light mt-1 leading-relaxed">
                        Our enrollment coordinator will message you directly at <span className="font-bold text-gray-900">{formData.whatsappNumber || "your registered number"}</span> within the next few hours to schedule your first class.
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-gray-100 relative z-10" />

                  <div className="flex gap-5 items-start relative z-10">
                    <div className="w-10 h-10 border border-[#D4AF37]/30 rounded-full flex items-center justify-center text-[#D4AF37] shrink-0">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Official Billing Info</h4>
                      <p className="text-gray-500 font-light mt-1 leading-relaxed mb-4">
                        If you choose to continue after your trial, tuition is processed through our official NayaPay account:
                      </p>
                      <div className="flex items-center justify-between bg-[#F9F9F9] border border-gray-200 p-4">
                        <span className="font-black tracking-widest text-gray-900">+92 3006024699</span>
                        <button type="button" onClick={copyNayaPay} className="p-2 hover:bg-gray-100 transition-colors text-[#D4AF37]">
                          {copied ? <CheckCircle2 className="w-4 h-4 text-[#0F5132]" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => router.push("/dashboard")}
                  className="group w-full bg-[#0F5132] text-white px-8 py-5 font-black uppercase tracking-[0.2em] text-xs hover:bg-[#D4AF37] hover:text-[#0F5132] transition-colors flex justify-center items-center gap-2"
                >
                  Enter Student Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ) : (
              /* ===== REGISTRATION FORM ===== */
              <motion.form variants={containerVariants} initial="hidden" animate="show" onSubmit={handleSubmit} className="space-y-10">
                
                {status === "error" && (
                  <motion.div variants={itemVariants} className="bg-red-50 border-l-4 border-red-600 text-red-800 px-5 py-4 text-sm font-light">
                    {errorMessage}
                  </motion.div>
                )}

                {/* Account / Role Selection */}
                <div className="space-y-4">
                  <motion.div variants={itemVariants} className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F5132]">Account Role</span>
                    <span className="flex-1 h-px bg-[#0F5132]/10" />
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Registering As</label>
                    <select 
                      name="role" 
                      value={formData.role} 
                      onChange={handleChange} 
                      className="w-full bg-transparent border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-[#0F5132] transition-colors text-gray-900 font-light cursor-pointer text-base rounded-none"
                    >
                      <option value="student">Student / Quran Learner</option>
                    </select>
                  </motion.div>
                </div>

                {/* Guardian Details */}
                <div className="space-y-8">
                  <motion.div variants={itemVariants} className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F5132]">Parent / Guardian</span>
                    <span className="flex-1 h-px bg-[#0F5132]/10" />
                  </motion.div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <motion.div variants={itemVariants} className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Full Name</label>
                      <input name="parentName" value={formData.parentName} onChange={handleChange} required type="text" placeholder="John Doe" className="w-full bg-transparent border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-[#0F5132] transition-colors text-gray-900 font-light placeholder-gray-300 text-lg rounded-none" />
                    </motion.div>
                    <motion.div variants={itemVariants} className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Email Address</label>
                      <input name="email" value={formData.email} onChange={handleChange} required type="email" placeholder="john@example.com" className="w-full bg-transparent border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-[#0F5132] transition-colors text-gray-900 font-light placeholder-gray-300 text-lg rounded-none" />
                    </motion.div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <motion.div variants={itemVariants} className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">WhatsApp Number</label>
                      <input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required type="tel" placeholder="+1 234 567 8900" className="w-full bg-transparent border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-[#0F5132] transition-colors text-gray-900 font-light placeholder-gray-300 text-lg rounded-none" />
                    </motion.div>
                    <motion.div variants={itemVariants} className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Country of Residence</label>
                      <input name="country" value={formData.country} onChange={handleChange} required type="text" placeholder="UK, USA, Australia..." className="w-full bg-transparent border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-[#0F5132] transition-colors text-gray-900 font-light placeholder-gray-300 text-lg rounded-none" />
                    </motion.div>
                  </div>

                  <motion.div variants={itemVariants} className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Portal Password</label>
                    <div className="relative">
                      <input name="password" value={formData.password} onChange={handleChange} required type={showPassword ? "text" : "password"} placeholder="Create a secure password" className="w-full bg-transparent border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-[#0F5132] transition-colors text-gray-900 font-light placeholder-gray-300 text-lg rounded-none pr-14" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F5132] transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>
                </div>

                {/* Student Details */}
                <div className="space-y-8">
                  <motion.div variants={itemVariants} className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F5132]">Student Details</span>
                    <span className="flex-1 h-px bg-[#0F5132]/10" />
                  </motion.div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <motion.div variants={itemVariants} className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Student's Name</label>
                      <input name="studentName" value={formData.studentName} onChange={handleChange} required type="text" placeholder="Student Name" className="w-full bg-transparent border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-[#0F5132] transition-colors text-gray-900 font-light placeholder-gray-300 text-lg rounded-none" />
                    </motion.div>
                    <motion.div variants={itemVariants} className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Student's Age</label>
                      <input name="studentAge" value={formData.studentAge} onChange={handleChange} required type="number" placeholder="e.g. 7" min="4" max="99" className="w-full bg-transparent border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-[#0F5132] transition-colors text-gray-900 font-light placeholder-gray-300 text-lg rounded-none" />
                    </motion.div>
                  </div>

                  <motion.div variants={itemVariants} className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Select Desired Course</label>
                    <select name="selectedCourse" value={formData.selectedCourse} onChange={handleChange} required className="w-full bg-transparent border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-[#0F5132] transition-colors text-gray-900 font-light cursor-pointer text-lg rounded-none appearance-none">
                      <option value="" disabled>Select a course...</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.title}>{course.title}</option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Any special requirements? (Optional)</label>
                    <textarea name="specialRequirements" value={formData.specialRequirements} onChange={handleChange} rows={3} placeholder="e.g. Prefer weekend classes, needs female tutor, etc." className="w-full bg-transparent border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-[#0F5132] transition-colors text-gray-900 font-light placeholder-gray-300 text-lg resize-none rounded-none"></textarea>
                  </motion.div>
                </div>

                <motion.div variants={itemVariants} className="pt-4">
                  <button 
                    disabled={status === "submitting"} type="submit" 
                    className="group w-full bg-[#0F5132] text-white px-8 py-5 font-black uppercase tracking-[0.2em] text-xs hover:bg-[#D4AF37] hover:text-[#0F5132] transition-colors disabled:opacity-70 flex justify-center items-center gap-3"
                  >
                    {status === "submitting" ? <span className="animate-pulse">Processing...</span> : <>Submit Application & Book Trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                  </button>
                </motion.div>
                
                <motion.div variants={itemVariants} className="text-center space-y-4 pb-4">
                  <p className="text-xs text-gray-400 font-light">By submitting, you agree to our terms and privacy policy. Your data is secure.</p>
                  <Link href="/login" className="text-sm font-light text-gray-500 hover:text-[#0F5132] transition-colors">
                    Already registered? <span className="text-[#0F5132] font-bold">Sign In to Portal</span>
                  </Link>
                </motion.div>
              </motion.form>
            )}

            {/* Back to home */}
            <div className="text-center mt-8 pb-8">
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