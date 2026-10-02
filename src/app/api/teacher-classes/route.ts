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
      select: {
        id: true,
        course: true,
        studentName: true,
      },
    });

    const courseMap = new Map<string, number>();
    for (const s of students) {
      const courseName = s.course || "General Tajweed";
      courseMap.set(courseName, (courseMap.get(courseName) || 0) + 1);
    }

    const classes = Array.from(courseMap.entries()).map(([course, studentCount]) => ({
      course,
      studentCount,
    }));

    return NextResponse.json({
      success: true,
      classes,
      totalStudents: students.length,
    });
  } catch (error: any) {
    console.error("Teacher Classes Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch teacher classes" },
      { status: 500 }
    );
  }
}
