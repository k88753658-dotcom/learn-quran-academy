"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Sparkles, BookOpen, Clock, Link as LinkIcon, 
  PenTool, CheckCircle2, ShieldCheck, LogOut, TrendingUp,
  Video, LayoutDashboard, MessageCircle, ChevronRight, Menu, X, HelpCircle,
  FileText
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function TeacherDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  // State for updating student data
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, [router]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/teacher-dashboard');
      const json = await res.json();
      
      if (json.success) {
        setDashboardData(json.data);
        
        // Fetch global admin announcements for the teacher
        const annRes = await fetch('/api/get-active-announcements');
        const annJson = await annRes.json();
        if (annJson.success) setAnnouncements(annJson.announcements || []);
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStudent = async (studentId: string, updatedData: any) => {
    setUpdatingId(studentId);
    try {
      const res = await fetch("/api/update-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, ...updatedData })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccessId(studentId);
        fetchDashboard(); // Refresh data
        setTimeout(() => setSuccessId(null), 3000); // Hide success message after 3s
      } else {
        alert("Update failed: " + data.error);
      }
    } catch (error) {
      alert("Network error while syncing data.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkAttendance = async (studentId: string, status: "Present" | "Absent" | "Late") => {
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, status })
      });
      if ((await res.json()).success) {
        alert(`Marked ${status}`);
        fetchDashboard();
      }
    } catch (e) { 
      alert("Error logging attendance."); 
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.clear();
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/login');
          },
        },
      });
    } catch (e) {
      console.error("Sign out error:", e);
    }
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
        <div className="w-16 h-16 border-4 border-[#0F5132]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
      </div>
    );
  }

  const { teacher, students } = dashboardData;
  const teacherName = teacher?.name || "Instructor";

  const avgProgress = students.length > 0 
    ? Math.round(students.reduce((acc: number, curr: any) => acc + (Number(curr.progress) || 0), 0) / students.length)
    : 0;

  const navItems = [
    { icon: LayoutDashboard, label: "Overview" },
    { icon: Users, label: "My Students" },
    { icon: Clock, label: "Schedule" },
    { icon: MessageCircle, label: "Support" },
  ];

  // --- TAB COMPONENTS ---

  const OverviewTab = () => (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#0F5132]/10 p-6 flex items-center gap-4 w-full">
          <div className="w-12 h-12 bg-[#0F5132]/5 flex items-center justify-center text-[#0F5132] shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Students</p>
            <p className="text-2xl font-serif text-gray-900 mt-1">{students.length}</p>
          </div>
        </div>
        
        <div className="bg-white border border-[#0F5132]/10 p-6 flex items-center gap-4 w-full">
          <div className="w-12 h-12 bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Class Mastery Avg</p>
            <p className="text-2xl font-serif text-gray-900 mt-1">{avgProgress}%</p>
          </div>
        </div>

        <div className="bg-white border border-[#0F5132]/10 p-6 flex items-center gap-4 w-full">
          <div className="w-12 h-12 bg-[#0F5132]/5 flex items-center justify-center text-[#0F5132] shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sessions Today</p>
            <p className="text-sm font-bold text-gray-900 mt-1 truncate">0 / {students.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8 w-full">
          <div className="bg-white border border-[#0F5132]/20 relative overflow-hidden w-full">
            <div className="h-1 w-full bg-[#0F5132]" />
            <div className="p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                <div>
                  <h2 className="text-xl font-serif text-[#0F5132] mb-1">Welcome back, {teacherName}</h2>
                  <p className="text-sm text-gray-500 font-light">Manage your assigned students and their academic progress.</p>
                </div>
              </div>
              <button onClick={() => setActiveTab("My Students")} className="w-full bg-[#0F5132] text-white py-4 font-black uppercase tracking-[0.2em] text-xs hover:bg-[#D4AF37] hover:text-[#0F5132] transition-colors flex items-center justify-center gap-2">
                <Users className="w-4 h-4" /> Go to Roster
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8 w-full">
          <div className="bg-white border border-[#0F5132]/10 p-6 w-full">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-6">Instructor Profile</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#F9F9F9] border border-[#0F5132]/20 flex items-center justify-center text-[#0F5132] font-serif text-xl shrink-0">
                {teacherName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-gray-900 truncate">{teacherName}</h4>
                <p className="text-xs text-gray-500 font-light">{teacher.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Announcements */}
        {announcements.length > 0 && (
          <div className="bg-white border border-[#0F5132]/10 p-6 w-full lg:col-span-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Broadcasts from Admin</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {announcements.map((ann: any) => (
                <div key={ann._id} className="p-4 border border-[#0F5132]/10 hover:border-[#0F5132]/20 transition-colors">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <p className="text-sm font-bold text-gray-900">{ann.title}</p>
                    <span className="text-[10px] text-gray-400 shrink-0">{new Date(ann.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 font-light">{ann.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const MyStudentsTab = () => (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="bg-white border border-[#0F5132]/10 p-8 w-full">
        <h2 className="text-2xl font-serif text-[#0F5132] mb-2">My Students</h2>
        <p className="text-sm text-gray-500 font-light mb-8">Mark attendance, push live links, and manage progress.</p>

        {students.length === 0 ? (
          <div className="p-12 text-center border border-gray-100 bg-[#F9F9F9]">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-[#0F5132]">No Students Assigned</h3>
            <p className="text-sm text-gray-500 mt-2 font-light">The administration will assign students to your roster soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AnimatePresence>
              {students.map((student: any) => (
                <motion.div 
                  key={student._id} 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border border-[#0F5132]/10 p-6 relative overflow-hidden bg-white"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${student.enrolled ? "bg-emerald-500" : "bg-amber-400"}`} />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{student.student_name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-1 mt-1">
                        <BookOpen className="w-3 h-3" /> {student.course || "General"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Mastery</span>
                      <p className="text-xl font-black text-[#0F5132]">{student.progress || 0}%</p>
                    </div>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleUpdateStudent(student._id, {
                        liveClassroomLink: formData.get("liveLink"),
                        progress: Number(formData.get("progress")),
                        lastAssignment: formData.get("assignment"),
                        sessionNotes: formData.get("notes")
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                        <Video className="w-3 h-3" /> Live Link
                      </label>
                      <input 
                        type="url" name="liveLink" defaultValue={student.live_classroom_link}
                        placeholder="Zoom/Meet Link" 
                        className="w-full bg-[#F9F9F9] border border-gray-200 p-3 text-sm outline-none focus:border-[#0F5132]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                          <TrendingUp className="w-3 h-3" /> Progress %
                        </label>
                        <input 
                          type="number" name="progress" min="0" max="100" defaultValue={student.progress || 0}
                          className="w-full bg-[#F9F9F9] border border-gray-200 p-3 text-sm outline-none focus:border-[#0F5132]"
                        />
                      </div>
                      
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                          <PenTool className="w-3 h-3" /> Assignment / Surah
                        </label>
                        <input 
                          type="text" name="assignment" defaultValue={student.last_assignment}
                          placeholder="e.g. Surah Al-Fatiha" 
                          className="w-full bg-[#F9F9F9] border border-gray-200 p-3 text-sm outline-none focus:border-[#0F5132]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" /> Private Session Notes
                      </label>
                      <textarea 
                        name="notes" defaultValue={student.session_notes || ""} rows={2}
                        placeholder="Notes for your reference..." 
                        className="w-full bg-[#F9F9F9] border border-gray-200 p-3 text-sm outline-none focus:border-[#0F5132] resize-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-[#0F5132]/10 mt-4">
                      <button 
                        type="submit" disabled={updatingId === student._id}
                        className="flex-1 bg-[#0F5132] text-white py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-colors"
                      >
                        {updatingId === student._id ? "Saving..." : successId === student._id ? "Saved!" : "Save Data"}
                      </button>
                    </div>
                  </form>
                  
                  {/* Attendance & Parent Row */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button onClick={() => handleMarkAttendance(student._id, "Present")} className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold border border-green-200 hover:bg-green-100">Present</button>
                      <button onClick={() => handleMarkAttendance(student._id, "Absent")} className="px-3 py-1 bg-red-50 text-red-700 text-[10px] font-bold border border-red-200 hover:bg-red-100">Absent</button>
                      <button onClick={() => handleMarkAttendance(student._id, "Late")} className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 hover:bg-amber-100">Late</button>
                    </div>
                    <button className="text-[10px] font-bold text-[#0F5132] underline">
                      Contact Parent
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );

  const ScheduleTab = () => (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="bg-white border border-[#0F5132]/10 p-8 w-full text-center">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-serif text-[#0F5132]">Schedule Management</h3>
        <p className="text-sm text-gray-500 mt-2 font-light">The timetable feature is currently under construction.</p>
      </div>
    </div>
  );

  const SupportTab = () => (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <div className="bg-white border border-[#0F5132]/10 p-8 w-full">
          <div className="w-12 h-12 bg-[#F9F9F9] border border-[#0F5132]/20 flex items-center justify-center text-[#0F5132] mb-6">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-serif text-[#0F5132] mb-2">Admin Support</h3>
          <p className="text-sm text-gray-500 mb-8">Need help with your roster or scheduling? Contact our academy admins.</p>
          <button className="w-full bg-[#25D366] text-white py-4 font-black uppercase tracking-widest text-xs hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" /> WhatsApp Admin
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview": return <OverviewTab />;
      case "My Students": return <MyStudentsTab />;
      case "Schedule": return <ScheduleTab />;
      case "Support": return <SupportTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-gray-900 font-sans flex selection:bg-[#0F5132] selection:text-white overflow-x-hidden w-full">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-[#0F5132]/10 z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col shrink-0`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#0F5132]/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-[#0F5132] text-[#D4AF37] font-serif italic text-sm">LQ</div>
            <span className="font-black uppercase tracking-widest text-[10px] text-gray-900">Instructor</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-500 hover:text-[#0F5132]">
            <X className="w-5 h-5" />
          </button>
        </div>

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

        <div className="p-4 border-t border-[#0F5132]/5">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            End Shift
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 min-w-0 flex flex-col h-screen w-full">
        <header className="h-20 bg-white border-b border-[#0F5132]/10 px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 shrink-0 w-full">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-gray-500 hover:text-[#0F5132]">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-serif text-[#0F5132] truncate">{activeTab}</h1>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-gray-900">{teacherName}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Instructor</p>
            </div>
            <div className="w-10 h-10 bg-[#F9F9F9] border border-[#0F5132]/20 flex items-center justify-center text-[#0F5132] font-serif text-lg shrink-0">
              {teacherName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 w-full">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}