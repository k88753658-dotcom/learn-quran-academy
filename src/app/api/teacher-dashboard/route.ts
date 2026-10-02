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

    // 2. Fetch Teacher Profile and enforce teacher role
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile || profile.role !== "teacher") {
      return NextResponse.json(
        { success: false, error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // 3. Fetch Assigned Students filtered by teacherId with billing
    const students = await prisma.student.findMany({
      where: { teacherId: profile.id },
      include: { billing: true },
      orderBy: { studentName: "asc" },
    });

    // 4. Update teacher's lastActive timestamp
    await prisma.profile.update({
      where: { id: profile.id },
      data: { lastActive: new Date() },
    });

    // 5. Serialize response with both camelCase and snake_case aliases for UI compatibility
    return NextResponse.json({
      success: true,
      data: {
        teacher: profile,
        students: students.map((s) => ({
          id: s.id,
          _id: s.id,
          studentId: s.id,
          studentName: s.studentName,
          student_name: s.studentName,
          parentName: s.parentName,
          parent_name: s.parentName,
          course: s.course,
          enrolled: s.enrolled,
          progress: s.progress ?? 0,
          lastAssignment: s.lastAssignment || "",
          last_assignment: s.lastAssignment || "",
          liveClassroomLink: s.liveClassroomLink || "",
          live_classroom_link: s.liveClassroomLink || "",
          billing: s.billing ? [s.billing] : [],
        })),
      },
    });
  } catch (error: any) {
    console.error("Teacher Dashboard Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
