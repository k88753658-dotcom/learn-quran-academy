import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Authorize admin caller
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
      select: { role: true },
    });

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Access Denied: Admin privileges required" },
        { status: 403 }
      );
    }

    // 2. Timezone & date calculation for today's attendance (UTC midnight boundary)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    // 3. Parallel Prisma aggregation queries
    const [
      totalStudents,
      pendingPayments,
      presentCount,
      activeCoursesCount,
      studentCourses,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.billing.count({ where: { status: "Pending" } }),
      prisma.attendance.count({
        where: {
          status: "Present",
          date: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.course.count(),
      prisma.student.findMany({
        select: { course: true },
        where: { course: { not: null } },
      }),
    ]);

    // 4. Safe metric calculations with zero-division defense
    const uniqueStudentCourses = new Set(
      studentCourses.map((s) => s.course).filter(Boolean)
    ).size;
    const activeCourses = Math.max(activeCoursesCount, uniqueStudentCourses);

    const attendanceRate =
      totalStudents > 0
        ? Math.round((presentCount / totalStudents) * 100)
        : 0;

    // 5. Return standardized payload expected by frontend and tests
    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        attendanceRate,
        activeCourses,
        pendingPayments,
      },
    });
  } catch (error: any) {
    console.error("API Error in admin-stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve administrative statistics" },
      { status: 500 }
    );
  }
}