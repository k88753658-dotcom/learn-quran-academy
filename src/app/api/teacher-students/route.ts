import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Teacher access required" },
        { status: 403 }
      );
    }

    const students = await prisma.student.findMany({
      where: { teacherId: profile.id },
      include: { billing: true },
      orderBy: { studentName: "asc" },
    });

    const safeStudents = students.map((s) => ({
      id: s.id,
      _id: s.id,
      studentName: s.studentName,
      student_name: s.studentName,
      parentName: s.parentName,
      parent_name: s.parentName,
      course: s.course,
      enrolled: s.enrolled,
      progress: s.progress ?? 0,
      liveClassroomLink: s.liveClassroomLink || "",
      live_classroom_link: s.liveClassroomLink || "",
      lastAssignment: s.lastAssignment || "",
      last_assignment: s.lastAssignment || "",
      billing: s.billing ? [s.billing] : [],
    }));

    return NextResponse.json({
      success: true,
      students: safeStudents,
    });
  } catch (error: any) {
    console.error("Teacher Students Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch teacher students" },
      { status: 500 }
    );
  }
}
