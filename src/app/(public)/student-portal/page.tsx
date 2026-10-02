"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

function PortalContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");

  const [activeTab, setActiveTab] = useState("classroom");
  const [studentData, setStudentData] = useState<any>(null);
  const [sessionDetails, setSessionDetails] = useState({ active: false, url: "" });
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [inputTxId, setInputTxId] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("NayaPay");
  const [isSyncingPayment, setIsSyncingPayment] = useState(false);
  const [isMarked, setIsMarked] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile();
      fetchLiveSession();
      fetchAnnouncements();
      const interval = setInterval(fetchLiveSession, 20000);
      return () => clearInterval(interval);
    }
  }, [studentId]);

  const fetchStudentProfile = async () => {
    try {
      const res = await fetch(`/api/student-profile?id=${studentId}`);
      const data = await res.json();
      if (data.success) {
        setStudentData(data.data);
        if (data.data.isMarkedToday) {
          setIsMarked(true);
        }
      }
    } catch (e) {
      console.error("Error fetching student profile", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`/api/get-active-announcements?studentId=${studentId}`);
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements || []);
      }
    } catch (e) {
      console.error("Failed to load announcements", e);
    }
  };

  const fetchLiveSession = async () => {
    try {
      const res = await fetch(`/api/live-session?studentId=${studentId}`);
      const data = await res.json();
      if (data.success) {
        setSessionDetails({ active: data.active, url: data.url });
      }
    } catch (e) {
      console.error("Error fetching live link", e);
    }
  };

  const handleSelfAttendance = async () => {
    setMarking(true);
    try {
      const res = await fetch("/api/student-self-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId })
      });
      const data = await res.json();
      if (data.success) {
        setIsMarked(true);
        alert("Alhamdulillah! Your attendance has been logged.");
        fetchStudentProfile();
      } else {
        alert(data.error || "Failed to log attendance.");
      }
    } catch (e) {
      alert("Network error. Please check your connection.");
    } finally {
      setMarking(false);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTxId.trim().length < 6) return alert("Please enter a valid Transaction ID.");

    setIsSyncingPayment(true);
    try {
      const res = await fetch("/api/verify-manual-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          studentId, 
          transactionId: inputTxId, 
          methodUsed: selectedWallet 
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Alhamdulillah! Your payment transaction has been logged for administrative verification.");
        setInputTxId("");
        fetchStudentProfile();
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Database sync communication timeout.");
    } finally {
      setIsSyncingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF0]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#50C878] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5C4033] font-bold">Synchronizing Academic Record...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF0] p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold text-[#5C4033] mb-2">Access Restricted</h2>
          <p className="text-gray-500">Please log in with a valid student ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#5C4033]">
      {/* Live Announcement Banner System */}
      {announcements.length > 0 && (
        <div className="bg-[#5C4033] text-white">
          {announcements.map((note) => (
            <motion.div 
              key={note._id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="border-b border-white/10 px-6 py-3 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{note.type === "Global" ? "📢" : "✨"}</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                    {note.title}
                  </p>
                  <p className="text-xs font-medium opacity-90">{note.text}</p>
                </div>
              </div>
              <button 
                onClick={() => setAnnouncements(prev => prev.filter(a => a._id !== note._id))}
                className="text-white/50 hover:text-white text-xs font-bold transition-colors"
              >
                Dismiss
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <header className="bg-white border-b border-[#D2B48C]/20 p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase text-[#D4AF37] tracking-widest">Assalamu Alaikum</span>
            <h1 className="text-3xl font-black text-[#5C4033] mt-0.5">{studentData.name}</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-end">
            {!isMarked ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSelfAttendance}
                disabled={marking}
                className="w-full sm:w-auto bg-[#50C878] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-[#50C878]/20 hover:bg-[#45b56c] transition-all"
              >
                {marking ? "Logging..." : "📝 Mark My Attendance"}
              </motion.button>
            ) : (
              <span className="w-full sm:w-auto text-center bg-[#50C878]/10 text-[#50C878] px-6 py-2.5 rounded-xl font-bold text-sm border border-[#50C878]/20">
                ✓ Present Today
              </span>
            )}

            <div className="flex gap-6 bg-[#FDFCF0] px-6 py-3 rounded-2xl border border-[#D2B48C]/10 text-sm font-semibold w-full sm:w-auto justify-center">
              <div>📖 Program: <span className="text-[#50C878]">{studentData.course}</span></div>
              <div>🗓️ Attendance: <span className="text-[#50C878]">{studentData.attendanceRate}%</span></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-3">
          {[
            { id: "classroom", label: "🎥 Live Zoom Class", icon: "✨" },
            { id: "progress", label: "📊 Academic Progress", icon: "📈" },
            { id: "assignments", label: "📝 Daily Tasks", icon: "📜" },
            { id: "billing", label: "💳 Fees & Invoices", icon: "💸" }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-[#5C4033] text-white shadow-xl shadow-[#5C4033]/10"
                  : "bg-white hover:bg-gray-50 border border-[#D2B48C]/10"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {/* Schedule Ribbon */}
          <div className="bg-white p-4 rounded-2xl border border-[#D2B48C]/10 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs font-bold text-[#5C4033]/70 uppercase tracking-wider">
            <div className="flex items-center justify-center gap-2 bg-[#FDFCF0] py-2 rounded-xl border border-dashed border-[#D2B48C]/20">
              <span className="w-2 h-2 rounded-full bg-[#50C878]"></span> Mon: 04:00 PM
            </div>
            <div className="flex items-center justify-center gap-2 bg-[#FDFCF0] py-2 rounded-xl border border-dashed border-[#D2B48C]/20">
              <span className="w-2 h-2 rounded-full bg-[#50C878]"></span> Wed: 04:00 PM
            </div>
            <div className="flex items-center justify-center gap-2 bg-[#FDFCF0] py-2 rounded-xl border border-dashed border-[#D2B48C]/20">
              <span className="w-2 h-2 rounded-full bg-[#50C878]"></span> Fri: 04:00 PM
            </div>
            <div className="flex items-center justify-center gap-2 text-[#D4AF37] bg-[#FDFCF0] py-2 rounded-xl border border-dashed border-[#D2B48C]/20">
              📍 Timezone: PKT
            </div>
          </div>

          {activeTab === "classroom" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-[#D2B48C]/20 shadow-sm">
                <h2 className="text-xl font-bold mb-2 text-[#5C4033]">Your Virtual Classroom</h2>
                {sessionDetails.active ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-[#5C4033]/10 shadow-inner">
                    <iframe src={sessionDetails.url} allow="camera; microphone; fullscreen; display-capture" className="absolute top-0 left-0 w-full h-full border-0" />
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#D2B48C]/30 bg-[#FDFCF0]/50 rounded-2xl text-center px-6">
                    <span className="text-5xl mb-4 animate-pulse">⏳</span>
                    <h3 className="text-xl font-bold text-[#5C4033]">Waiting for Instructor</h3>
                    <p className="text-sm text-gray-500 mt-2">The teacher will activate your private session link shortly.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "billing" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-[#D2B48C]/20 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Amount Due</span>
                    <h3 className="text-3xl font-black text-[#5C4033] mt-1">{studentData?.billing?.amountDue || "3000 PKR"}</h3>
                    <p className="text-xs text-gray-500 mt-2">Due Date: <span className="font-bold text-[#5C4033]">{studentData?.billing?.dueDate || "10th of Month"}</span></p>
                  </div>
                  <div className="mt-6">
                    {studentData?.billing?.status === "Paid" ? (
                      <span className="block text-center bg-[#50C878]/10 text-[#50C878] py-2.5 rounded-xl font-bold text-sm border border-[#50C878]/20">Paid (Alhamdulillah)</span>
                    ) : studentData?.billing?.status === "Reviewing" ? (
                      <span className="block text-center bg-amber-500/10 text-amber-600 py-2.5 rounded-xl font-bold text-sm border border-amber-500/20 animate-pulse">⏳ Verification Pending</span>
                    ) : (
                      <span className="block text-center bg-red-500/10 text-red-600 py-2.5 rounded-xl font-bold text-sm border border-red-500/20">Payment Pending</span>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#D2B48C]/20 shadow-sm md:col-span-2">
                  <h3 className="font-bold text-lg text-[#5C4033] mb-2 text-center md:text-left">Submit Payment Proof</h3>
                  
                  {studentData?.billing?.status === "Paid" ? (
                    <p className="text-sm text-emerald-600 font-semibold bg-emerald-50/50 p-4 rounded-xl border border-emerald-500/10 text-center">Your invoice dues for this active period are entirely cleared. JazakAllah Khair!</p>
                  ) : studentData?.billing?.status === "Reviewing" ? (
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-500/10 text-center text-sm text-amber-800">
                      Your recent submission reference identifier code <code className="bg-white px-1.5 py-0.5 rounded font-bold">{studentData?.billing?.submittedTx}</code> is currently being validated by administration. Access keys will unlock shortly.
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitProof} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                          value={selectedWallet}
                          onChange={(e) => setSelectedWallet(e.target.value)}
                          className="p-3 bg-[#FDFCF0] border border-[#D2B48C]/20 rounded-xl text-xs text-[#5C4033] font-semibold outline-none"
                        >
                          <option value="NayaPay">NayaPay Wallet</option>
                          <option value="EasyPaisa">EasyPaisa Mobile Account</option>
                          <option value="JazzCash">JazzCash Wallet</option>
                          <option value="Bank Transfer">Direct Bank Transfer</option>
                        </select>
                        <input
                          type="text"
                          required
                          placeholder="Enter Transaction ID / Ref #"
                          value={inputTxId}
                          onChange={(e) => setInputTxId(e.target.value)}
                          className="p-3 bg-[#FDFCF0] border border-[#D2B48C]/20 rounded-xl text-xs font-bold tracking-wider uppercase outline-none focus:border-[#50C878]"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSyncingPayment}
                        className="w-full bg-[#5C4033] text-white p-3 rounded-xl font-bold hover:bg-[#4A3329] transition-all text-xs uppercase tracking-wider"
                      >
                        {isSyncingPayment ? "Verifying Reference..." : "Submit Payment Receipt Reference"}
                      </button>
                    </form>
                  )}

                  <div className="mt-4 bg-[#FDFCF0] p-4 rounded-2xl border border-[#D2B48C]/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                    <div>
                      <strong className="text-gray-400 uppercase tracking-widest text-[9px] block mb-1 font-bold">NayaPay / EasyPaisa</strong>
                      📱 03xx-xxxxxxx<br />
                      👤 Title: Learn Quran Academy
                    </div>
                    <div>
                      <strong className="text-gray-400 uppercase tracking-widest text-[9px] block mb-1 font-bold">Meezan Bank Account</strong>
                      🏦 Account Number: xxxx-xxxxxxxx-xxxx<br />
                      💼 Branch: Islamabad, Pakistan
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "progress" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-[#D2B48C]/20 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-[#5C4033]">Academic Syllabus Tracker</h2>
                  <button 
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-white border border-[#D2B48C]/30 text-[#5C4033] font-bold rounded-xl text-xs hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    🖨️ Print Progress Card
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-[#FDFCF0] p-5 rounded-2xl border border-[#D2B48C]/10">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Book</span>
                    <p className="text-xl font-black text-[#5C4033] mt-1">{studentData.syllabus?.bookType || "Quran"}</p>
                  </div>
                  <div className="bg-[#FDFCF0] p-5 rounded-2xl border border-[#D2B48C]/10">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Lesson Target</span>
                    <p className="text-xl font-black text-[#5C4033] mt-1">
                      {studentData.syllabus?.surahName || "Starting"} — {studentData.syllabus?.verseNumber ? `Ayah ${studentData.syllabus.verseNumber}` : "Page 1"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>Overall Mastery Syllabus Metrics</span>
                  <span className="text-[#50C878]">{studentData.progress || 0}% Complete</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${studentData.progress || 0}%` }} transition={{ duration: 1 }} className="bg-[#50C878] h-full rounded-full" />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "assignments" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-[#D2B48C]/20 shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-[#5C4033]">Daily Homework Log</h2>
                <div className="p-6 bg-[#FDFCF0] border border-[#D2B48C]/20 rounded-2xl flex gap-4 items-start shadow-sm">
                  <div className="text-2xl p-2 bg-white rounded-xl border border-gray-100 shadow-sm">📝</div>
                  <div>
                    <h3 className="font-bold text-lg text-[#5C4033] mb-1">Instructor Note</h3>
                    <p className="text-gray-600 leading-relaxed text-sm mb-4">{studentData.assignment || "No new tasks assigned."}</p>
                    <span className="inline-block bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      Live Update
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function StudentPortal() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FDFCF0]">Loading Academic Portal...</div>}>
      <PortalContent />
    </Suspense>
  );
}