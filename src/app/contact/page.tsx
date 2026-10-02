"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Phone, Mail, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Fully controlled form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    course: "Noorani Qaida",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        subject: `New Inquiry about ${formData.course}`,
        message: `WhatsApp Number: ${formData.whatsapp || "Not provided"}\n\nMessage:\n${formData.message}`,
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && (data?.success || !data)) {
        setStatus("success");
        setFormData({ name: "", email: "", whatsapp: "", course: "Noorani Qaida", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(data?.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Contact Form Error:", err);
      setStatus("error");
      setErrorMessage("Network error. Please check your connection.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F9F9F9] text-gray-900 pt-32 pb-0 font-sans relative overflow-x-hidden selection:bg-[#0F5132] selection:text-white">
        
        {/* --- AMBIENT BACKGROUND GLOWS --- */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/10 blur-[120px] rounded-full z-0 pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-[800px] h-[800px] bg-[#0F5132]/5 blur-[120px] rounded-full z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 mb-32">
          
          {/* --- HERO TEXT --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-24"
          >
            <div className="inline-flex items-center gap-3 justify-center mb-8">
              <span className="w-10 h-[2px] bg-[#D4AF37]" />
              <span className="text-[#0F5132] text-xs font-black uppercase tracking-[0.3em]">We are here to help</span>
              <span className="w-10 h-[2px] bg-[#D4AF37]" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif text-[#0F5132] tracking-tight leading-[1.1] mb-8">
              Let's start your child's <br className="hidden md:block" />
              <span className="text-[#D4AF37] italic font-light">journey.</span>
            </h1>
            <p className="text-xl text-gray-600 font-light leading-relaxed">
              Have questions about our curriculum, scheduling, or the 3-day free trial? Reach out to our dedicated academic support team.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-16 items-start border-t border-[#0F5132]/10 pt-16">
            
            {/* =========================================================================
                LEFT COLUMN: CONTACT INFO (EDITORIAL LIST)
            ========================================================================= */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2 space-y-12"
            >
              <div className="group">
                <div className="w-12 h-12 border border-[#D4AF37]/50 rounded-full flex items-center justify-center text-[#0F5132] mb-6 group-hover:bg-[#0F5132] group-hover:text-white transition-colors duration-500">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-serif text-gray-900 mb-3">WhatsApp Support</h3>
                <p className="text-base text-gray-600 font-light mb-4 leading-relaxed">Fastest response time. Chat directly with our enrollment coordinators.</p>
                <a href="https://wa.me/923046263947" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] font-black tracking-[0.2em] text-xs uppercase hover:text-[#0F5132] transition-colors flex items-center gap-2">
                  +92 304 626 3947
                </a>
              </div>

              <div className="w-full h-px bg-[#0F5132]/10" />

              <div className="group">
                <div className="w-12 h-12 border border-[#D4AF37]/50 rounded-full flex items-center justify-center text-[#0F5132] mb-6 group-hover:bg-[#0F5132] group-hover:text-white transition-colors duration-500">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-serif text-gray-900 mb-3">Email Us</h3>
                <p className="text-base text-gray-600 font-light mb-4 leading-relaxed">Prefer email? Drop us a line and we'll get back to you within 24 hours.</p>
                <a href="mailto:learnquranacaademy.me@gmail.com" className="text-[#D4AF37] font-black tracking-[0.1em] text-xs uppercase hover:text-[#0F5132] transition-colors break-all flex items-center gap-2">
                  learnquranacaademy.me@gmail.com
                </a>
              </div>

              <div className="w-full h-px bg-[#0F5132]/10" />

              <div className="group">
                <div className="w-12 h-12 border border-[#D4AF37]/50 rounded-full flex items-center justify-center text-[#0F5132] mb-6 group-hover:bg-[#0F5132] group-hover:text-white transition-colors duration-500">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-serif text-gray-900 mb-3">Global Academy Hours</h3>
                <p className="text-base text-gray-600 font-light mb-6 leading-relaxed">We operate across multiple timezones to serve our students in the US, UK, Canada, and Australia.</p>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-[#0F5132]/5 pb-4">
                    <span className="text-gray-600 font-light uppercase tracking-widest text-[10px]">Monday - Friday</span>
                    <span className="text-[#0F5132] font-black tracking-widest text-[10px] uppercase">24 Hours</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-gray-600 font-light uppercase tracking-widest text-[10px]">Saturday - Sunday</span>
                    <span className="text-[#0F5132] font-black tracking-widest text-[10px] uppercase">Limited Support</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* =========================================================================
                RIGHT COLUMN: THE FUNCTIONAL FORM (EDITORIAL STYLING)
            ========================================================================= */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-3 bg-white p-10 md:p-16 border border-[#0F5132]/10 relative shadow-2xl"
            >
              {/* Elegant golden offset border */}
              <div className="absolute inset-0 border border-[#D4AF37] translate-x-3 translate-y-3 pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 relative z-10"
                  >
                    <div className="w-20 h-20 bg-[#0F5132]/5 text-[#0F5132] rounded-full flex items-center justify-center mb-4 border border-[#0F5132]/20">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-4xl font-serif text-gray-900 tracking-tight">Message Sent!</h3>
                    <p className="text-gray-600 font-light max-w-sm leading-relaxed text-lg">
                      JazakAllah Khair for reaching out. One of our coordinators will contact you via email or WhatsApp shortly.
                    </p>
                    <button 
                      onClick={() => setStatus("idle")}
                      className="mt-8 bg-transparent text-[#0F5132] px-8 py-4 border border-[#0F5132] font-black uppercase tracking-[0.2em] text-xs hover:bg-[#0F5132] hover:text-white transition-colors"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="space-y-8 relative z-10"
                  >
                    {status === "error" && (
                      <div className="bg-red-50 border-l-4 border-red-600 text-red-800 px-6 py-4 text-sm font-light flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" /> {errorMessage}
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Parent's Name</label>
                        <input 
                          required name="name" value={formData.name} onChange={handleChange}
                          type="text" placeholder="John Doe"
                          className="w-full bg-transparent border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-[#0F5132] transition-colors text-gray-900 font-light placeholder-gray-300 text-lg rounded-none"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Email Address</label>
                        <input 
                          required name="email" value={formData.email} onChange={handleChange}
                          type="email" placeholder="john@example.com"
                          className="w-full bg-transparent border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-[#0F5132] transition-colors text-gray-900 font-light placeholder-gray-300 text-lg rounded-none"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">WhatsApp Number (Optional)</label>
                        <input 
                          name="whatsapp" value={formData.whatsapp} onChange={handleChange}
                          type="tel" placeholder="+1 234 567 8900"
                          className="w-full bg-transparent border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-[#0F5132] transition-colors text-gray-900 font-light placeholder-gray-300 text-lg rounded-none"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Interested Course</label>
                        <select 
                          name="course" value={formData.course} onChange={handleChange}
                          className="w-full bg-transparent border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-[#0F5132] transition-colors text-gray-900 font-light cursor-pointer text-lg rounded-none appearance-none"
                        >
                          <option value="Noorani Qaida">Noorani Qaida</option>
                          <option value="Quran with Tajweed">Quran with Tajweed</option>
                          <option value="Quran Memorization (Hifz)">Quran Memorization (Hifz)</option>
                          <option value="Islamic Studies">Islamic Studies</option>
                          <option value="Other inquiry">Other inquiry</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Your Message</label>
                      <textarea 
                        required name="message" value={formData.message} onChange={handleChange}
                        rows={4} placeholder="How can we help you today?"
                        className="w-full bg-transparent border-b border-gray-300 px-0 py-3 focus:outline-none focus:border-[#0F5132] transition-colors text-gray-900 font-light placeholder-gray-300 text-lg resize-none rounded-none"
                      ></textarea>
                    </div>

                    <button 
                      disabled={status === "submitting"}
                      type="submit" 
                      className="group w-full bg-[#0F5132] text-white px-8 py-5 font-black uppercase tracking-[0.2em] text-xs hover:bg-[#D4AF37] hover:text-[#0F5132] transition-colors disabled:opacity-70 flex justify-center items-center gap-3 mt-8"
                    >
                      {status === "submitting" ? (
                        <span className="animate-pulse flex items-center gap-2">
                          <Clock className="w-4 h-4 animate-spin" /> Sending...
                        </span>
                      ) : (
                        <>Send Message <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}