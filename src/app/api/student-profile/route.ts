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

    const { searchParams } = new URL(req.url);
    const paramId = searchParams.get("id");

    let studentId = paramId;

    // If no ID param provided, try resolving from authenticated session
    if (!studentId) {
      const selfStudent = await prisma.student.findFirst({
        where: {
          OR: [{ id: userId }, { profileId: userId }],
        },
        select: { id: true },
      });
      if (selfStudent) {
        studentId = selfStudent.id;
      }
    }

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Valid Student ID parameter required." },
        { status: 400 }
      );
    }

    // Fetch student with billing record
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { billing: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student record not found in database." },
        { status: 404 }
      );
    }

    // Parallel Attendance Metrics Aggregation
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    const [totalSessions, presentSessions, checkInToday] = await Promise.all([
      prisma.attendance.count({
        where: { studentId },
      }),
      prisma.attendance.count({
        where: {
          studentId,
          status: "Present",
        },
      }),
      prisma.attendance.findFirst({
        where: {
          studentId,
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
    ]);

    const attendanceRate = totalSessions > 0
      ? Math.round((presentSessions / totalSessions) * 100)
      : 100;

    return NextResponse.json({
      success: true,
      data: {
        id: student.id,
        name: student.studentName,
        studentName: student.studentName,
        course: student.course || "General Tajweed",
        attendanceRate,
        isMarkedToday: !!checkInToday,
        lastAssignment: student.lastAssignment || "No assignments yet.",
        enrollmentDate: student.createdAt,
        progress: student.progress ?? 0,
        billing: student.billing || {
          amountDue: "3000 PKR",
          dueDate: "10th of this month",
          status: "Pending",
        },
        syllabus: {
          bookType: "Quran",
          surahName: "Noorani Qaida Introduction",
          verseNumber: "Lesson 1",
        },
      },
    });
  } catch (error: any) {
    console.error("Student Profile Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error fetching profile." },
      { status: 500 }
    );
  }
}