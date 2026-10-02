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
      orderBy: { studentName: "asc" },
    });

    const schedule = students.map((s) => ({
      id: s.id,
      _id: s.id,
      studentName: s.studentName,
      course: s.course,
      enrolled: s.enrolled,
      progress: s.progress ?? 0,
      liveClassroomLink: s.liveClassroomLink || "",
      lastAssignment: s.lastAssignment || "",
    }));

    return NextResponse.json({
      success: true,
      schedule,
    });
  } catch (error: any) {
    console.error("Teacher Schedule Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch teacher schedule" },
      { status: 500 }
    );
  }
}
