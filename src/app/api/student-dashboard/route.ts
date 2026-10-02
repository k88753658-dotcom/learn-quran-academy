import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Authenticate user via session
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Fetch Student Record with assigned teacher, billing, and attendance
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ profileId: userId }, { id: userId }],
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        billing: true,
        attendances: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // 3. Serialize response maintaining frontend contract compatibility
    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          _id: student.id,
          studentName: student.studentName,
          parentName: student.parentName,
          course: student.course,
          enrolled: student.enrolled,
          progress: student.progress ?? 0,
          liveClassroomLink: student.liveClassroomLink || "",
          lastAssignment: student.lastAssignment || "",
        },
        teacher: student.teacher || null,
        billing: student.billing ? [student.billing] : [],
        attendance: (student.attendances || []).map((a) => ({
          id: a.id,
          _id: a.id,
          studentId: a.studentId,
          date: a.date,
          status: a.status,
        })),
      },
    });
  } catch (error: any) {
    console.error("Student Dashboard Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
