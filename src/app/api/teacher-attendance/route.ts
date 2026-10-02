import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const filterStudentId = searchParams.get("studentId");

    // Fetch teacher's student IDs
    const teacherStudents = await prisma.student.findMany({
      where: { teacherId: profile.id },
      select: { id: true, studentName: true },
    });

    const studentIds = teacherStudents.map((s) => s.id);
    let targetIds = studentIds;

    if (filterStudentId) {
      if (profile.role === "admin") {
        targetIds = [filterStudentId];
      } else if (studentIds.includes(filterStudentId)) {
        targetIds = [filterStudentId];
      } else {
        return NextResponse.json({ success: true, attendances: [] });
      }
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        studentId: { in: targetIds },
      },
      include: {
        student: {
          select: { studentName: true },
        },
        markedBy: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
      take: 50,
    });

    const safeLogs = attendances.map((a) => ({
      id: a.id,
      _id: a.id,
      studentId: a.studentId,
      studentName: a.student?.studentName || "Student",
      date: a.date.toISOString().split("T")[0],
      status: a.status,
      markedBy: a.markedBy?.name || "Teacher",
    }));

    return NextResponse.json({
      success: true,
      attendances: safeLogs,
      logs: safeLogs,
    });
  } catch (error: any) {
    console.error("Teacher Attendance Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch teacher attendance" },
      { status: 500 }
    );
  }
}
