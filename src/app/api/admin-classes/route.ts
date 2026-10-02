import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Authorize admin caller
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access: Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const callerProfile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!callerProfile || callerProfile.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required." },
        { status: 403 }
      );
    }

    // 2. Query courses and student enrollments
    const [courses, students] = await Promise.all([
      prisma.course.findMany({
        orderBy: { title: "asc" },
      }),
      prisma.student.findMany({
        select: {
          id: true,
          course: true,
          enrolled: true,
        },
      }),
    ]);

    // 3. Map course enrollment statistics
    const classes = courses.map((course) => {
      const courseStudents = students.filter(
        (s) =>
          s.course &&
          s.course.trim().toLowerCase() === course.title.trim().toLowerCase()
      );

      return {
        id: course.id,
        _id: course.id,
        title: course.title,
        description: course.description,
        enrolledCount: courseStudents.filter((s) => s.enrolled).length,
        totalCount: courseStudents.length,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      classes,
    });
  } catch (error: any) {
    console.error("API Error in admin-classes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve academy classes" },
      { status: 500 }
    );
  }
}
