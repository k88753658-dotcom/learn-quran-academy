"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, BookOpen, CreditCard, MessageCircle, 
  LogOut, PlayCircle, Clock, CheckCircle2,
  ChevronRight, Calendar, AlertCircle, Menu, X, BookText, FileText,
  Download, ExternalLink, HelpCircle
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function StudentDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/student-dashboard');
        const json = await res.json();
        
        if (json.success) {
          setDashboardData(json.data);
          // Fetch announcements using the student's DB id
          const studentId = json.data?.student?.id;
          if (studentId) {
            const annRes = await fetch(`/api/get-active-announcements?studentId=${studentId}`);
            const annJson = await annRes.json();
            if (annJson.success) setAnnouncements(annJson.announcements || []);
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboard();
  }, [router]);

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center font-sans">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-2 border-[#0F5132] border-t-transparent rounded-full mb-4" />
        <p className="text-[#0F5132] font-black tracking-widest uppercase text-[10px]">Loading Workspace...</p>
      </div>
    );
  }

  const { student, teacher, billing, attendance } = dashboardData;

  const studentName = student?.studentName || "Student";
  const courseName = student?.course || "Course";
  const teacherName = teacher?.name || "Pending Assignment";
  const liveLink = student?.liveClassroomLink || "";
  
  // Find the most recent billing record
  const currentBilling = billing?.length > 0 ? billing[0] : null;
  const status = currentBilling?.status || "Trial Phase";

  // Calculate real attendance %
  const totalSessions = attendance?.length || 0;
  const presentSessions = attendance?.filter((a: any) => a.status === 'Present').length || 0;
  const attendancePct = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

  const handleSignOut = async () => {
    try {
      localStorage.clear();
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (e) {
      console.error("Sign out error:", e);
    }
    router.push("/login");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Overview" },
    { icon: BookOpen, label: "My Classes" },
    { icon: BookText, label: "Syllabus" },
    { icon: CreditCard, label: "Billing" },
    { icon: MessageCircle, label: "Support" },
  ];

  // --- TAB COMPONENTS ---

  const OverviewTab = () => (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#0F5132]/10 p-6 flex items-center gap-4 w-full">
          <div className="w-12 h-12 bg-[#0F5132]/5 flex items-center justify-center text-[#0F5132] shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Attendance</p>
            <p className={`text-2xl font-serif mt-1 ${attendancePct >= 80 ? 'text-green-600' : attendancePct >= 60 ? 'text-amber-500' : 'text-red-500'}`}>{attendancePct}%</p>
          </div>
        </div>
        
        <div className="bg-white border border-[#0F5132]/10 p-6 flex items-center gap-4 w-full">
          <div className="w-12 h-12 bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Course</p>
            <p className="text-sm font-bold text-gray-900 mt-1 truncate">{courseName}</p>
          </div>
        </div>

        <div className="bg-white border border-[#0F5132]/10 p-6 flex items-center gap-4 w-full">
          <div className="w-12 h-12 bg-[#0F5132]/5 flex items-center justify-center text-[#0F5132] shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Status</p>
            <p className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-2 truncate">
              {status === "Paid" ? (
                <><span className="w-2 h-2 rounded-full bg-green-500 shrink-0" /> Active</>
              ) : (
                <><span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" /> Trial Phase</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Immediate Action & Tasks */}
        <div className="lg:col-span-2 space-y-8 w-full">
          {/* Upcoming Class Card */}
          <div className="bg-white border border-[#0F5132]/20 relative overflow-hidden w-full">
            <div className="h-1 w-full bg-[#0F5132]" />
            <div className="p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                <div>
                  <h2 className="text-xl font-serif text-[#0F5132] mb-1">Upcoming Session</h2>
                  <p className="text-sm text-gray-500 font-light">Join your virtual classroom at the scheduled time.</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#0F5132] bg-[#0F5132]/5 px-3 py-1 shrink-0">
                  <Clock className="w-3 h-3" /> Scheduled
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 p-6 border border-[#0F5132]/10 bg-[#F9F9F9] mb-8">
                <div className="w-full md:w-auto text-center md:text-left md:border-r border-[#0F5132]/10 md:pr-8 shrink-0">
                  <p className="text-3xl font-serif text-[#0F5132]">5:00</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">PM (Local Time)</p>
                </div>
                <div className="w-full md:w-auto flex-1 text-center md:text-left min-w-0">
                  <p className="font-bold text-gray-900 mb-1">Today</p>
                  <p className="text-sm text-gray-500 font-light truncate">{courseName}</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  if (liveLink) {
                    window.open(liveLink, '_blank', 'noopener,noreferrer');
                  } else {
                    alert("Your teacher hasn't started the class yet. Please check back shortly.");
                  }
                }}
                className={`w-full py-4 font-black uppercase tracking-[0.2em] text-xs transition-colors flex items-center justify-center gap-2 ${
                  liveLink 
                    ? 'bg-[#0F5132] text-white hover:bg-[#D4AF37] hover:text-[#0F5132]' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <PlayCircle className="w-4 h-4" /> {liveLink ? 'Enter Classroom' : 'Awaiting Teacher...'}
              </button>
            </div>
          </div>

          {/* Dynamic Announcements */}
          <div className="bg-white border border-[#0F5132]/10 p-8 w-full">
            <h2 className="text-lg font-serif text-gray-900 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#D4AF37]" /> Latest Updates
            </h2>
            <div className="space-y-4 w-full">
              {announcements.length === 0 ? (
                <div className="p-4 border border-gray-100 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0F5132]">Academy Notice</span>
                  </div>
                  <p className="text-sm text-gray-600 font-light">Welcome to your Student Portal! No new announcements at this time.</p>
                </div>
              ) : (
                announcements.map((ann: any) => (
                  <div key={ann._id} className="p-4 border border-gray-100 hover:border-[#0F5132]/20 transition-colors w-full">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#0F5132]">{ann.type === 'Targeted' ? 'Personal Message' : 'Academy Broadcast'}</span>
                      <span className="text-xs text-gray-400 shrink-0">{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 mb-1">{ann.title}</p>
                    <p className="text-sm text-gray-600 font-light">{ann.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Instructor */}
        <div className="space-y-8 w-full">
          <div className="bg-white border border-[#0F5132]/10 p-6 w-full">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-6">Assigned Instructor</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#F9F9F9] border border-[#0F5132]/20 flex items-center justify-center text-[#0F5132] font-serif text-xl shrink-0">
                {teacherName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-gray-900 truncate">{teacherName}</h4>
                <p className="text-xs text-gray-500 font-light">Certified Academy Tutor</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab("Support")}
              className="w-full text-xs font-bold text-[#0F5132] border border-[#0F5132]/20 py-2 hover:bg-[#0F5132] hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Message Tutor
            </button>
          </div>

          <div className="bg-white border border-[#0F5132]/10 p-6 w-full">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-6">Quick Resources</h3>
            <div className="space-y-2 w-full">
              <button onClick={() => setActiveTab("Syllabus")} className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:bg-[#F9F9F9] border border-transparent hover:border-[#0F5132]/10 transition-colors">
                <span className="flex items-center gap-3"><FileText className="w-4 h-4 text-gray-400" /> Course Syllabus</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
              <button onClick={() => setActiveTab("Billing")} className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:bg-[#F9F9F9] border border-transparent hover:border-[#0F5132]/10 transition-colors">
                <span className="flex items-center gap-3"><CreditCard className="w-4 h-4 text-gray-400" /> Payment History</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MyClassesTab = () => (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="bg-white border border-[#0F5132]/10 p-8 w-full">
        <h2 className="text-2xl font-serif text-[#0F5132] mb-2">My Classes</h2>
        <p className="text-sm text-gray-500 font-light mb-8">Manage your schedule and view session history.</p>
        
        <div className="border border-[#0F5132]/10 bg-[#F9F9F9] p-6 mb-8 w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Enrolled Course</p>
            <p className="font-bold text-gray-900 text-xl">{courseName}</p>
          </div>
          <div className="w-full md:w-auto">
            <button 
              onClick={() => liveLink ? window.open(liveLink, '_blank', 'noopener,noreferrer') : alert("Your teacher hasn't started the class yet.")}
              className={`w-full md:w-auto px-6 py-3 font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 ${
                liveLink ? 'bg-[#0F5132] text-white hover:bg-[#D4AF37]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}>
              <PlayCircle className="w-4 h-4" /> {liveLink ? 'Join Live Classroom' : 'Awaiting Teacher...'}
            </button>
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-[#0F5132]/10 pb-2">Recent Session History</h3>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-[#0F5132]/10">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Topic Covered</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance && attendance.length > 0 ? (
                attendance.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-[#0F5132]/5 hover:bg-[#F9F9F9] transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-900 font-medium">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">Session</td>
                    <td className="py-4 px-4 text-sm text-gray-600">30 mins</td>
                    <td className="py-4 px-4 text-sm text-right text-[#0F5132] font-bold">{row.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 text-sm">No recent sessions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const SyllabusTab = () => (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="bg-white border border-[#0F5132]/10 p-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-serif text-[#0F5132] mb-1">Course Syllabus</h2>
            <p className="text-sm text-gray-500 font-light">Track your academic progress module by module.</p>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-[#0F5132] bg-[#0F5132]/5 px-4 py-2 hover:bg-[#0F5132]/10 transition-colors">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>

        <div className="w-full bg-[#F9F9F9] h-2 mb-8 relative">
          <div className="absolute top-0 left-0 h-full bg-[#0F5132] w-[20%]" />
        </div>

        <div className="space-y-4 w-full">
          {[
            { mod: "Module 1: Arabic Alphabet (Huroof e Mufradaat)", threshold: 0 },
            { mod: "Module 2: Joint Letters (Murakkabaat)", threshold: 25 },
            { mod: "Module 3: Harakaat (Short Vowels)", threshold: 50 },
            { mod: "Module 4: Tanween (Double Vowels)", threshold: 75 },
          ].map((m, i) => {
            const studentProgress = student?.progress || 0;
            let stat = "locked";
            if (studentProgress >= m.threshold + 25) stat = "completed";
            else if (studentProgress >= m.threshold) stat = "current";

            return (
            <div key={i} className={`p-5 border w-full flex items-center justify-between ${
              stat === "completed" ? "border-green-200 bg-green-50" : 
              stat === "current" ? "border-[#0F5132] bg-white shadow-sm" : 
              "border-gray-100 bg-[#F9F9F9] opacity-70"
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  stat === "completed" ? "bg-green-500 text-white" : 
                  stat === "current" ? "border-2 border-[#0F5132] text-[#0F5132]" : 
                  "border-2 border-gray-300 text-gray-300"
                }`}>
                  {stat === "completed" && <CheckCircle2 className="w-4 h-4" />}
                  {stat === "current" && <div className="w-2 h-2 rounded-full bg-[#0F5132]" />}
                </div>
                <span className={`font-bold ${stat === "locked" ? "text-gray-400" : "text-gray-900"}`}>{m.mod}</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 hidden sm:block">
                {stat}
              </span>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const BillingTab = () => (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Status */}
        <div className="bg-white border border-[#0F5132]/10 p-8 w-full">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-6">Current Plan</h3>
          <h4 className="font-serif text-4xl text-[#0F5132] mb-3">
            {status === "Paid" ? "Active" : "Free Trial"}
          </h4>
          <p className="text-sm text-gray-500 mb-8">
            {status === "Paid" 
              ? "Your account is in good standing. Next automatic charge is scheduled." 
              : "You are currently exploring the academy for free. Upgrade to continue your journey."}
          </p>
          {status !== "Paid" && (
            <button className="w-full bg-[#D4AF37] text-[#0F5132] py-4 font-black uppercase tracking-widest text-xs hover:bg-[#c39b2b] transition-colors">
              Upgrade to Premium
            </button>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-[#F9F9F9] border border-[#0F5132]/10 p-8 w-full">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Payment Method</h3>
          <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 mb-4">
            <CreditCard className="w-6 h-6 text-gray-400" />
            <div>
              <p className="font-bold text-gray-900">No card on file</p>
              <p className="text-xs text-gray-500">Add a payment method for seamless billing</p>
            </div>
          </div>
          <button className="w-full bg-white text-[#0F5132] border border-[#0F5132] py-3 font-black uppercase tracking-widest text-[10px] hover:bg-[#0F5132] hover:text-white transition-colors">
            Add Payment Method
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white border border-[#0F5132]/10 p-8 w-full">
        <h3 className="text-sm font-bold text-gray-900 mb-6 border-b border-[#0F5132]/10 pb-2">Invoice History</h3>
        {billing && billing.length > 0 ? (
          <div className="space-y-3 w-full">
            {billing.map((inv: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-4 border border-[#0F5132]/10 hover:border-[#0F5132]/30 transition-colors bg-[#F9F9F9]">
                <div>
                  <p className="font-bold text-gray-900">{inv.amount_due}</p>
                  <p className="text-xs text-gray-500">{new Date(inv.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No past invoices available.</p>
          </div>
        )}
      </div>
    </div>
  );

  const SupportTab = () => (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        
        {/* Contact Teacher */}
        <div className="bg-white border border-[#0F5132]/10 p-8 w-full">
          <div className="w-12 h-12 bg-[#F9F9F9] border border-[#0F5132]/20 flex items-center justify-center text-[#0F5132] mb-6">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-serif text-[#0F5132] mb-2">Academic Support</h3>
          <p className="text-sm text-gray-500 mb-8">Have a question about a lesson or assignment? Message your assigned tutor directly.</p>
          <button className="w-full bg-[#25D366] text-white py-4 font-black uppercase tracking-widest text-xs hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" /> WhatsApp Tutor
          </button>
        </div>

        {/* Contact Admin */}
        <div className="bg-white border border-[#0F5132]/10 p-8 w-full">
          <div className="w-12 h-12 bg-[#F9F9F9] border border-[#0F5132]/20 flex items-center justify-center text-[#0F5132] mb-6">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-serif text-[#0F5132] mb-2">Admin Support</h3>
          <p className="text-sm text-gray-500 mb-8">Need help with billing, scheduling, or portal access? Contact our academy admins.</p>
          <button className="w-full bg-[#0F5132] text-white py-4 font-black uppercase tracking-widest text-xs hover:bg-[#0a3822] transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" /> WhatsApp Admin
          </button>
        </div>

      </div>
    </div>
  );

  // Router for Tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview": return <OverviewTab />;
      case "My Classes": return <MyClassesTab />;
      case "Syllabus": return <SyllabusTab />;
      case "Billing": return <BillingTab />;
      case "Support": return <SupportTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-gray-900 font-sans flex selection:bg-[#0F5132] selection:text-white overflow-x-hidden w-full">
      
      {/* --- MOBILE OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* --- SIDEBAR --- */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-[#0F5132]/10 z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col shrink-0`}>
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#0F5132]/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-[#0F5132] text-[#D4AF37] font-serif italic text-sm">LQ</div>
            <span className="font-black uppercase tracking-widest text-[10px] text-gray-900">Student Portal</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-500 hover:text-[#0F5132]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item, idx) => (
            <button 
              key={idx}
              onClick={() => { setActiveTab(item.label); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === item.label 
                  ? "bg-[#0F5132] text-white" 
                  : "text-gray-500 hover:bg-[#0F5132]/5 hover:text-[#0F5132]"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User / Sign Out */}
        <div className="p-4 border-t border-[#0F5132]/5">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 lg:ml-64 min-w-0 flex flex-col h-screen w-full">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-[#0F5132]/10 px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 shrink-0 w-full">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-gray-500 hover:text-[#0F5132]">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-serif text-[#0F5132] truncate">{activeTab}</h1>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-gray-900">{studentName}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Student</p>
            </div>
            <div className="w-10 h-10 bg-[#F9F9F9] border border-[#0F5132]/20 flex items-center justify-center text-[#0F5132] font-serif text-lg shrink-0">
              {studentName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dashboard Dynamic Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 w-full">
          {renderTabContent()}
        </div>
      </main>

    </div>
  );
}