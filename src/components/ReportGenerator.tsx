"use client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ReportProps {
  student: any;
  teacherName: string;
}

export default function ReportGenerator({ student, teacherName }: ReportProps) {
  const downloadPDF = async () => {
    const element = document.getElementById(`report-${student._id}`);
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${student.name}_Progress_Report.pdf`);
  };

  return (
    <div>
      <button 
        onClick={downloadPDF}
        className="text-[10px] bg-[#D4AF37] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#B8860B] transition-all"
      >
        📄 Generate Report
      </button>

      {/* Hidden Report Template (Used for PDF capture) */}
      <div className="absolute -left-full top-0 opacity-0 pointer-events-none">
        <div id={`report-${student._id}`} className="w-[210mm] p-20 bg-white text-[#5C4033] font-serif">
          <div className="text-center border-b-2 border-[#D2B48C] pb-10 mb-10">
            <h1 className="text-4xl font-black uppercase tracking-tighter">Learn Quran Academy</h1>
            <p className="text-[#D4AF37] font-bold mt-2">Official Student Progress Record</p>
          </div>

          <div className="grid grid-cols-2 gap-10 mb-10">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Student Name</p>
              <p className="text-xl font-bold">{student.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-gray-400">Date Issued</p>
              <p className="text-xl font-bold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#FDFCF0] p-6 rounded-2xl border border-[#D2B48C]/20">
              <h3 className="font-bold border-b border-[#D2B48C]/30 pb-2 mb-4">Quranic Proficiency</h3>
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Current Book:</strong> {student.syllabus?.bookType || "Quran"}</p>
                <p><strong>Current Lesson:</strong> {student.syllabus?.surahName || "N/A"}</p>
                <p><strong>Last Verse:</strong> Ayah {student.syllabus?.verseNumber || "1"}</p>
                <p><strong>Mastery Level:</strong> {student.progress || 0}%</p>
              </div>
            </div>

            <div className="bg-[#FDFCF0] p-6 rounded-2xl border border-[#D2B48C]/20">
              <h3 className="font-bold border-b border-[#D2B48C]/30 pb-2 mb-4">Attendance & Engagement</h3>
              <p>The student has maintained a global attendance rate of <strong>{student.attendanceRate || 0}%</strong>.</p>
            </div>

            <div className="pt-20 text-center">
              <div className="w-40 h-px bg-[#5C4033] mx-auto mb-2"></div>
              <p className="text-xs italic">Certified by Instructor: {teacherName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}