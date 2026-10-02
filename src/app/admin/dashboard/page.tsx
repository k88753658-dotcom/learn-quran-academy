"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { 
  Users, BookOpen, DollarSign, Activity, 
  Search, Plus, CheckCircle2, XCircle, Clock, ShieldCheck, Download,
  LayoutDashboard, GraduationCap, CreditCard, UserPlus, LogOut, Menu, X,
  ChevronRight, Bell, RefreshCw, Megaphone, ClipboardList
} from "lucide-react";

interface Teacher {
  _id: string;
  name: string;
  email: string;
  isOnline: boolean;
  studentCount: number;
}

interface Student {
  _id: string;
  studentName: string;
  parentName?: string;
  course: string;
  enrolled: boolean;
  teacherId?: string;
  billing?: {
    status: string;
    amountDue?: string;
  };
}

const sidebarLinks = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "applications", label: "Applications", icon: ClipboardList },
  { id: "staff", label: "Staff", icon: GraduationCap },
  { id: "students", label: "Students", icon: Users },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "announcements", label: "Announcements", icon: Megaphone },
];

function AddTeacherForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/add-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "teacher" }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", msg: data.message });
        setName(""); setEmail(""); setPassword("");
        onSuccess();
      } else {
        setFeedback({ type: "error", msg: data.error || "Failed to add teacher." });
      }
    } catch {
      setFeedback({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {feedback && (
        <div className={`p-3 text-xs font-medium border ${feedback.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {feedback.msg}
        </div>
      )}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Full Name</label>
        <input
          type="text" required value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Sheikh Abdullah"
          className="w-full px-3 py-2.5 border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#0F5132] font-light bg-white transition-colors"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Email Address</label>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="teacher@example.com"
          className="w-full px-3 py-2.5 border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#0F5132] font-light bg-white transition-colors"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Temporary Password</label>
        <input
          type="text" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Min. 6 characters"
          className="w-full px-3 py-2.5 border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#0F5132] font-light bg-white transition-colors"
        />
      </div>
      <button
        type="submit" disabled={isSubmitting}
        className="w-full bg-[#0F5132] text-white py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-[#0F5132] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Adding...</>
        ) : (
          <><UserPlus className="w-3.5 h-3.5" /> Add Teacher</>
        )}
      </button>
    </form>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

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

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "applications" | "staff" | "students" | "courses" | "billing" | "announcements">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [stats, setStats] = useState({ totalStudents: 0, attendanceRate: 0, activeCourses: 0, pendingPayments: 0 });
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Announcement state
  const [annTitle, setAnnTitle] = useState("");
  const [annText, setAnnText] = useState("");
  const [annType, setAnnType] = useState<"Global" | "Targeted">("Global");
  const [annTarget, setAnnTarget] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Course state
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  const dataLoaded = useRef(false);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push("/login");
      return;
    }
    const userRole = (session?.user as any)?.role;
    const localRole = typeof window !== "undefined" ? localStorage.getItem("user_role") : null;
    const isAdmin = userRole === "admin" || localRole === "admin";
    if (!isAdmin) {
      router.push("/login");
      return;
    }
    if (userRole) {
      localStorage.setItem("user_role", userRole);
    }
    // Only load data once — session object reference changes cause re-renders
    if (!dataLoaded.current) {
      dataLoaded.current = true;
      refreshData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, session?.user?.id]);

  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([fetchStats(), fetchStudents(), fetchTeachers(), fetchApplications(), fetchCourses()]);
    setIsLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/admin-stats`);
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (e) { console.error(e); }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/get-students");
      const data = await res.json();
      if (data.success) setStudents(data.students || []);
    } catch (e) { console.error(e); }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/get-teachers");
      const data = await res.json();
      if (data.success) setTeachers(data.teachers || []);
    } catch (e) { console.error(e); }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/get-teacher-applications");
      const data = await res.json();
      if (data.success) setApplications(data.applications || []);
    } catch (e) { console.error(e); }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (data.success) setCourses(data.courses || []);
    } catch (e) { console.error(e); }
  };

  const handleApplicationAction = async (id: string, action: "approve" | "reject") => {
    const confirm = window.confirm(`Are you sure you want to ${action} this application?`);
    if (!confirm) return;

    try {
      const res = await fetch("/api/approve-teacher-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, action })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        refreshData();
      } else {
        alert(data.error || "Failed to process application.");
      }
    } catch (e) {
      alert("Network error processing application.");
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annText) return alert("Title and message are required.");
    if (annType === "Targeted" && !annTarget) return alert("Please select a target student.");

    setIsPublishing(true);
    try {
      const res = await fetch("/api/publish-announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: annTitle, 
          text: annText, 
          type: annType, 
          targetStudentId: annTarget || null 
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Announcement published successfully!");
        setAnnTitle("");
        setAnnText("");
        setAnnType("Global");
        setAnnTarget("");
      } else {
        alert(data.error || "Failed to publish announcement.");
      }
    } catch (e) {
      alert("Network error publishing announcement.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !courseDesc) return alert("Title and description are required.");
    setIsCreatingCourse(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: courseTitle, description: courseDesc })
      });
      const data = await res.json();
      if (data.success) {
        setCourseTitle("");
        setCourseDesc("");
        refreshData();
      } else {
        alert(data.error || "Failed to create course.");
      }
    } catch (e) {
      alert("Network error.");
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`/api/courses?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        refreshData();
      } else {
        alert(data.error || "Failed to delete course.");
      }
    } catch (e) {
      alert("Network error.");
    }
  };

  const handleAssignTeacher = async (studentId: string, teacherId: string) => {
    try {
      const res = await fetch("/api/assign-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, teacherId })
      });
      if ((await res.json()).success) {
        fetchStudents();
      }
    } catch (e) { 
      alert("Assignment error."); 
    }
  };

  const handleManualApprovalAction = async (studentId: string, action: "Approve" | "Reject") => {
    const confirmation = window.confirm(`Are you sure you want to ${action.toUpperCase()} this payment?`);
    if (!confirmation) return;
    
    try {
      const res = await fetch("/api/approve-manual-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action })
      });
      if ((await res.json()).success) { 
        refreshData(); 
      }
    } catch (e) { 
      alert("Billing sync error."); 
    }
  };

  const filteredStudents = students.filter((s) => 
    s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.billing?.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center font-sans">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-12 h-12 border-4 border-[#0F5132] border-t-transparent rounded-full mb-6" />
        <h2 className="text-[#0F5132] font-black tracking-[0.3em] uppercase text-xs">Syncing Database...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] font-sans flex selection:bg-[#0F5132] selection:text-white">
      
      {/* ===== SIDEBAR ===== */}
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-[260px] bg-[#0F5132] flex-col fixed inset-y-0 left-0 z-40">
        {/* Decorative glow */}
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Logo */}
        <div className="px-8 py-8 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-serif italic text-lg">
              LQ
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-tight">Learn Quran</p>
              <p className="text-white/40 text-[10px] font-light tracking-widest uppercase">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 relative z-10">
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm transition-all group ${
                activeTab === link.id 
                  ? "bg-white/15 text-white font-bold" 
                  : "text-white/50 hover:text-white hover:bg-white/5 font-light"
              }`}
            >
              <link.icon className={`w-[18px] h-[18px] ${activeTab === link.id ? "text-[#D4AF37]" : "text-white/30 group-hover:text-white/60"}`} />
              <span>{link.label}</span>
              {activeTab === link.id && <ChevronRight className="w-4 h-4 ml-auto text-[#D4AF37]" />}
            </button>
          ))}
        </nav>

        {/* Bottom: Sign out */}
        <div className="px-4 py-6 border-t border-white/10 relative z-10">
          <button 
            onClick={handleSignOut} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-light"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
              onClick={() => setSidebarOpen(false)} 
            />
            <motion.aside 
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#0F5132] z-50 lg:hidden flex flex-col"
            >
              <div className="px-6 py-6 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-serif italic text-lg">LQ</div>
                  <p className="text-white font-bold text-sm">Admin Panel</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1">
                {sidebarLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => { setActiveTab(link.id as any); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm transition-all ${
                      activeTab === link.id 
                        ? "bg-white/15 text-white font-bold" 
                        : "text-white/50 hover:text-white hover:bg-white/5 font-light"
                    }`}
                  >
                    <link.icon className={`w-[18px] h-[18px] ${activeTab === link.id ? "text-[#D4AF37]" : "text-white/30"}`} />
                    <span>{link.label}</span>
                  </button>
                ))}
              </nav>
              <div className="px-4 py-6 border-t border-white/10">
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-light">
                  <LogOut className="w-[18px] h-[18px]" /><span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 lg:ml-[260px] min-h-screen">
        
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200/80 px-6 lg:px-10 py-4 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-[#0F5132] transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 capitalize">{activeTab}</h1>
              <p className="text-[10px] text-gray-400 font-light tracking-widest uppercase">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={refreshData} className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:text-[#0F5132] hover:border-[#0F5132]/30 transition-colors" title="Refresh data">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:text-[#0F5132] hover:border-[#0F5132]/30 transition-colors relative" title="Notifications">
              <Bell className="w-4 h-4" />
              {stats.pendingPayments > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{stats.pendingPayments}</span>
              )}
            </button>
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="w-9 h-9 bg-[#0F5132] rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Administrator</p>
                <p className="text-[10px] text-gray-400 font-light">Full Access</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6 lg:p-10">
          <AnimatePresence mode="wait">
            
            {/* ===== OVERVIEW TAB ===== */}
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  {[
                    { label: "Active Students", val: stats.totalStudents, icon: Users, accent: "#0F5132" },
                    { label: "Attendance Avg", val: `${stats.attendanceRate}%`, icon: Activity, accent: "#0F5132" },
                    { label: "Courses Live", val: stats.activeCourses, icon: BookOpen, accent: "#D4AF37" },
                    { label: "Pending Bills", val: stats.pendingPayments, icon: DollarSign, accent: "#DC2626" },
                  ].map((item, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      key={i} 
                      className="bg-white p-6 border border-gray-200/80 hover:border-gray-300 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{item.label}</p>
                        <div className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg group-hover:border-gray-300 transition-colors">
                          <item.icon className="w-4 h-4" style={{ color: item.accent }} />
                        </div>
                      </div>
                      <h3 className="text-3xl font-serif tracking-tight" style={{ color: item.accent }}>{item.val}</h3>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions + Recent Activity */}
                <div className="grid lg:grid-cols-3 gap-5">
                  {/* Quick Actions */}
                  <div className="bg-white p-8 border border-gray-200/80 space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Quick Actions</h3>
                    <div className="space-y-3">
                      <button onClick={() => setActiveTab("applications")} className="w-full flex items-center gap-4 px-4 py-4 border border-gray-200 hover:border-[#0F5132]/30 hover:bg-[#0F5132]/5 transition-all group text-left">
                        <ClipboardList className="w-5 h-5 text-gray-400 group-hover:text-[#0F5132] transition-colors" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">Review Applications</p>
                          <p className="text-[10px] text-gray-400 font-light">Hire new instructors</p>
                        </div>
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-[#0F5132] transition-colors" />
                      </button>
                      <button onClick={() => setActiveTab("students")} className="w-full flex items-center gap-4 px-4 py-4 border border-gray-200 hover:border-[#0F5132]/30 hover:bg-[#0F5132]/5 transition-all group text-left">
                        <Users className="w-5 h-5 text-gray-400 group-hover:text-[#0F5132] transition-colors" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">Manage Students</p>
                          <p className="text-[10px] text-gray-400 font-light">Assign teachers & view roster</p>
                        </div>
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-[#0F5132] transition-colors" />
                      </button>
                      <button onClick={() => setActiveTab("billing")} className="w-full flex items-center gap-4 px-4 py-4 border border-gray-200 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all group text-left">
                        <CreditCard className="w-5 h-5 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">Review Payments</p>
                          <p className="text-[10px] text-gray-400 font-light">Approve pending invoices</p>
                        </div>
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-[#D4AF37] transition-colors" />
                      </button>
                      <button onClick={() => setActiveTab("announcements")} className="w-full flex items-center gap-4 px-4 py-4 border border-gray-200 hover:border-[#0F5132]/30 hover:bg-[#0F5132]/5 transition-all group text-left">
                        <Megaphone className="w-5 h-5 text-gray-400 group-hover:text-[#0F5132] transition-colors" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">Broadcast Announcement</p>
                          <p className="text-[10px] text-gray-400 font-light">Message students or staff</p>
                        </div>
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-[#0F5132] transition-colors" />
                      </button>
                    </div>
                  </div>

                  {/* Staff Overview */}
                  <div className="lg:col-span-2 bg-white p-8 border border-gray-200/80 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Staff Overview</h3>
                      <button onClick={() => setActiveTab("staff")} className="text-[10px] font-bold text-[#0F5132] hover:text-[#D4AF37] transition-colors uppercase tracking-widest">View All →</button>
                    </div>
                    {teachers.length === 0 ? (
                      <p className="text-gray-400 font-light text-sm py-8 text-center">No teachers onboarded yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {teachers.slice(0, 4).map((teacher) => (
                          <div key={teacher._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-[#0F5132] rounded-lg flex items-center justify-center text-white font-serif italic text-sm">
                                {teacher.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{teacher.name}</p>
                                <p className="text-[10px] text-gray-400 font-light">{teacher.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{teacher.studentCount} students</span>
                              <div className={`w-2.5 h-2.5 rounded-full ${teacher.isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===== APPLICATIONS TAB ===== */}
            {activeTab === "applications" && (
              <motion.div key="applications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-white border border-gray-200/80 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 bg-[#F9F9F9] flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F5132] flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Pending Instructor Applications
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-white border-b border-gray-100">
                        <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                          <th className="px-6 py-4">Applicant</th>
                          <th className="px-6 py-4">Credentials</th>
                          <th className="px-6 py-4">Bio / Specializations</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {applications.length === 0 ? (
                          <tr><td colSpan={5} className="text-center py-12 text-gray-400 font-light">No applications found.</td></tr>
                        ) : (
                          applications.map((app) => (
                            <tr key={app._id} className="hover:bg-[#F9F9F9] transition-colors">
                              <td className="px-6 py-5 align-top">
                                <p className="text-sm font-bold text-gray-900">{app.name}</p>
                                <p className="text-[10px] text-gray-400 font-light">{app.email}</p>
                                <p className="text-[10px] text-gray-400 font-light">{app.whatsapp}</p>
                              </td>
                              <td className="px-6 py-5 align-top">
                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-widest mb-1">{app.qualification}</span>
                                <p className="text-[10px] text-gray-400 font-light">{app.experienceYears} Years Exp.</p>
                              </td>
                              <td className="px-6 py-5 align-top max-w-xs">
                                <p className="text-xs text-gray-600 font-light line-clamp-2 mb-2">{app.bio}</p>
                                <div className="flex flex-wrap gap-1">
                                  {app.specializations?.map((s: string) => (
                                    <span key={s} className="px-2 py-0.5 bg-[#0F5132]/5 text-[#0F5132] text-[9px] font-bold uppercase tracking-widest border border-[#0F5132]/10">{s}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-5 align-top text-center">
                                <span className={`inline-flex px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${
                                  app.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  app.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {app.status}
                                </span>
                              </td>
                              <td className="px-6 py-5 align-top text-right">
                                {app.status === 'pending' && (
                                  <div className="flex flex-col gap-2 items-end">
                                    <button onClick={() => handleApplicationAction(app._id, "approve")} className="px-4 py-2 w-28 bg-[#0F5132] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0F5132] transition-colors">Approve</button>
                                    <button onClick={() => handleApplicationAction(app._id, "reject")} className="px-4 py-2 w-28 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">Reject</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===== STAFF TAB ===== */}
            {activeTab === "staff" && (
              <motion.div key="staff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="grid lg:grid-cols-3 gap-8">

                  {/* Add Teacher Form */}
                  <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-200/80 p-6 sticky top-24">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-6">Add New Teacher</h3>
                      <AddTeacherForm onSuccess={fetchTeachers} />
                    </div>
                  </div>

                  {/* Teacher List */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Current Staff ({teachers.length})</h3>
                    {teachers.length === 0 ? (
                      <div className="bg-white border border-gray-200/80 p-16 text-center">
                        <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 font-light">No teachers yet. Add your first teacher using the form.</p>
                      </div>
                    ) : (
                      teachers.map((teacher) => (
                        <div key={teacher._id} className="bg-white border border-gray-200/80 p-6 hover:border-gray-300 transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-[#0F5132] rounded-lg flex items-center justify-center text-[#D4AF37] font-serif italic text-xl">
                              {teacher.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{teacher.name}</h4>
                              <p className="text-xs text-gray-400 font-light">{teacher.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                              <p className="text-sm font-bold text-gray-900">{teacher.studentCount}</p>
                              <p className="text-[10px] text-gray-400 font-light uppercase tracking-widest">Students</p>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${teacher.isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} title={teacher.isOnline ? "Online" : "Offline"} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}


            {/* ===== STUDENTS TAB ===== */}
            {activeTab === "students" && (
              <motion.div key="students" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by student name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 bg-white outline-none focus:border-[#0F5132] text-sm text-gray-900 font-light transition-colors" 
                  />
                </div>
                <div className="bg-white border border-gray-200/80 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#F9F9F9] border-b border-gray-200">
                        <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4 text-center">Assigned Teacher</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredStudents.length === 0 ? (
                          <tr><td colSpan={4} className="text-center py-12 text-gray-400 font-light">No students found.</td></tr>
                        ) : (
                          filteredStudents.map((student) => (
                            <tr key={student._id} className="hover:bg-[#F9F9F9] transition-colors">
                              <td className="px-6 py-4">
                                <p className="text-sm font-bold text-gray-900">{student.studentName}</p>
                                <p className="text-[10px] text-gray-400 font-light">{student.course}</p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <select 
                                  onChange={(e) => handleAssignTeacher(student._id, e.target.value)}
                                  className="text-xs text-gray-900 bg-white border border-gray-200 p-2.5 outline-none focus:border-[#0F5132] cursor-pointer font-light"
                                  defaultValue={student.teacherId || ""}
                                >
                                  <option value="">Unassigned</option>
                                  {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 ${student.enrolled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${student.enrolled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                  {student.enrolled ? "ACTIVE" : "TRIAL"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-[#0F5132] transition-colors border border-gray-200 px-3 py-1.5 bg-white">
                                  <Download className="w-3 h-3" /> Report
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===== BILLING TAB ===== */}
            {activeTab === "billing" && (
              <motion.div key="billing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-white border border-gray-200/80 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 bg-[#F9F9F9] flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                      Invoices Awaiting Settlement
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-white border-b border-gray-100">
                        <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                          <th className="px-6 py-4">Account Holder</th>
                          <th className="px-6 py-4 text-center">Amount Due</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Manual Override</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((student) => (
                          <tr key={student._id} className="hover:bg-[#F9F9F9] transition-colors">
                            <td className="px-6 py-5">
                              <p className="text-sm font-bold text-gray-900">{student.parentName || "Guardian"}</p>
                              <p className="text-[10px] text-gray-400 font-light">Child: {student.studentName}</p>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="text-sm font-bold text-gray-900">
                                {student.billing?.amountDue || "3000 PKR"}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 ${
                                student.billing?.status === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>
                                {student.billing?.status === "Paid" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                {student.billing?.status === "Paid" ? "VERIFIED" : "PENDING"}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              {student.billing?.status !== "Paid" ? (
                                <div className="inline-flex gap-2">
                                  <button onClick={() => handleManualApprovalAction(student._id, "Approve")} className="px-4 py-2 bg-[#0F5132] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#D4AF37] hover:text-[#0F5132] transition-colors flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3" /> Approve
                                  </button>
                                  <button onClick={() => handleManualApprovalAction(student._id, "Reject")} className="px-4 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center gap-1.5">
                                    <XCircle className="w-3 h-3" /> Deny
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-400 font-light uppercase tracking-widest">Resolved</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===== ANNOUNCEMENTS TAB ===== */}
            {activeTab === "announcements" && (
              <motion.div key="announcements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
                <div className="bg-white border border-gray-200/80 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-200 bg-[#F9F9F9]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#0F5132]/5 border border-[#0F5132]/20 rounded-lg flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-[#0F5132]" />
                      </div>
                      <h3 className="text-[#0F5132] font-serif text-2xl tracking-tight">Broadcast Center</h3>
                    </div>
                    <p className="text-gray-500 font-light text-sm pl-13">Send official communications directly to user portals.</p>
                  </div>
                  
                  <div className="p-8">
                    <form onSubmit={handlePublishAnnouncement} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Message Audience</label>
                        <div className="flex gap-4">
                          <label className={`flex-1 flex items-center gap-3 p-4 border cursor-pointer transition-colors ${annType === "Global" ? "border-[#0F5132] bg-[#0F5132]/5" : "border-gray-200 hover:border-gray-300"}`}>
                            <input type="radio" name="annType" value="Global" checked={annType === "Global"} onChange={() => setAnnType("Global")} className="w-4 h-4 text-[#0F5132] focus:ring-[#0F5132]" />
                            <div>
                              <p className="text-sm font-bold text-gray-900">Global Broadcast</p>
                              <p className="text-[10px] text-gray-500 font-light mt-0.5">Visible to everyone</p>
                            </div>
                          </label>
                          <label className={`flex-1 flex items-center gap-3 p-4 border cursor-pointer transition-colors ${annType === "Targeted" ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-gray-200 hover:border-gray-300"}`}>
                            <input type="radio" name="annType" value="Targeted" checked={annType === "Targeted"} onChange={() => setAnnType("Targeted")} className="w-4 h-4 text-[#D4AF37] focus:ring-[#D4AF37]" />
                            <div>
                              <p className="text-sm font-bold text-gray-900">Targeted Message</p>
                              <p className="text-[10px] text-gray-500 font-light mt-0.5">Send to specific student</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {annType === "Targeted" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Select Recipient</label>
                          <select 
                            value={annTarget} 
                            onChange={(e) => setAnnTarget(e.target.value)}
                            className="w-full bg-[#F9F9F9] border border-gray-200 p-4 text-sm text-gray-900 outline-none focus:border-[#0F5132]"
                          >
                            <option value="">-- Choose a student --</option>
                            {students.map((s) => <option key={s._id} value={s._id}>{s.studentName} ({s.course})</option>)}
                          </select>
                        </motion.div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Subject / Title</label>
                        <input 
                          type="text" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)}
                          placeholder="e.g. Upcoming Eid Holidays" 
                          className="w-full bg-[#F9F9F9] border border-gray-200 p-4 text-sm text-gray-900 outline-none focus:border-[#0F5132]" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Message Content</label>
                        <textarea 
                          rows={5} value={annText} onChange={(e) => setAnnText(e.target.value)}
                          placeholder="Type your official announcement here..." 
                          className="w-full bg-[#F9F9F9] border border-gray-200 p-4 text-sm text-gray-900 outline-none focus:border-[#0F5132] resize-none" 
                        />
                      </div>

                      <button disabled={isPublishing} className="w-full bg-[#0F5132] text-white p-4 font-black uppercase tracking-[0.2em] text-xs hover:bg-[#D4AF37] hover:text-[#0F5132] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                        {isPublishing ? "Publishing..." : "Publish Broadcast"}
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===== COURSES TAB ===== */}
            {activeTab === "courses" && (
              <motion.div key="courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Create Course Form */}
                  <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-200/80 overflow-hidden sticky top-8">
                      <div className="px-6 py-5 border-b border-gray-200 bg-[#F9F9F9]">
                        <h3 className="text-[#0F5132] font-serif text-xl tracking-tight">Create Course</h3>
                      </div>
                      <div className="p-6">
                        <form onSubmit={handleCreateCourse} className="space-y-5">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Course Title</label>
                            <input type="text" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder="e.g. Noorani Qaida" className="w-full bg-[#F9F9F9] border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-[#0F5132]" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Description</label>
                            <textarea rows={4} value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} placeholder="Describe the course..." className="w-full bg-[#F9F9F9] border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-[#0F5132] resize-none" />
                          </div>
                          <button disabled={isCreatingCourse} className="w-full bg-[#0F5132] text-white p-3 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#D4AF37] hover:text-[#0F5132] transition-colors disabled:opacity-50">
                            {isCreatingCourse ? "Creating..." : "Add Course"}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                  
                  {/* Course List */}
                  <div className="lg:col-span-2 space-y-4">
                    {courses.length === 0 ? (
                      <div className="bg-white border border-gray-200/80 p-16 text-center">
                        <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 font-light">No courses available.</p>
                      </div>
                    ) : (
                      courses.map((course) => (
                        <div key={course.id} className="bg-white border border-gray-200/80 p-6 hover:border-gray-300 transition-colors flex flex-col md:flex-row gap-6 justify-between md:items-center">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg flex items-center justify-center text-[#D4AF37] shrink-0 mt-1 md:mt-0">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg mb-1">{course.title}</h4>
                              <p className="text-sm text-gray-500 font-light leading-relaxed max-w-lg">{course.description}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteCourse(course.id)} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors self-start md:self-auto shrink-0">
                            Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}