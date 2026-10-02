import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET: Fetch the live class link for a specific student
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ success: false, error: "Student ID required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { liveClassroomLink: true },
    });

    if (!student || !student.liveClassroomLink) {
      return NextResponse.json({ success: true, active: false, url: "" });
    }

    return NextResponse.json({ 
      success: true, 
      active: true, 
      url: student.liveClassroomLink 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Let the teacher target a specific student with a link
export async function POST(req: Request) {
  try {
    const { url, studentId } = await req.json();

    if (!url || !studentId) {
      return NextResponse.json({ success: false, error: "Missing link URL or Student Selection" }, { status: 400 });
    }

    let processedUrl = url;
    if (url.includes("zoom.us/j/")) {
      processedUrl = url.replace("zoom.us/j/", "zoom.us/wc/join/");
    }

    // --- AUTHENTICATION & AUTHORIZATION ---
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    // If teacher, ensure they own the student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Target student not found" }, { status: 404 });
    }

    if (profile.role === "teacher" && student.teacherId && student.teacherId !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized: Student not assigned to you" }, { status: 403 });
    }

    await prisma.student.update({
      where: { id: studentId },
      data: { liveClassroomLink: processedUrl },
    });

    return NextResponse.json({ success: true, message: "Live link launched for the selected student!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}