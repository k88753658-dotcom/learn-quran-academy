import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Authenticate caller session
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access: Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Authorize staff caller (Admin or Teacher)
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access: Staff privileges required." },
        { status: 403 }
      );
    }

    // 3. Fetch all teachers with student counts via single relational aggregation query
    const teachers = await prisma.profile.findMany({
      where: { role: "teacher" },
      include: {
        _count: {
          select: { teacherStudents: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // 4. Enrich teachers with online status and dual serialization properties
    const now = Date.now();
    const enrichedTeachers = teachers.map((teacher) => {
      const isOnline = teacher.lastActive
        ? now - new Date(teacher.lastActive).getTime() < 360000
        : false;

      return {
        id: teacher.id,
        _id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        whatsapp: teacher.whatsapp || null,
        qualification: teacher.qualification || null,
        specializations: teacher.specializations || [],
        experienceYears: teacher.experienceYears ?? 0,
        studentCount: teacher._count.teacherStudents,
        isOnline,
        lastActive: teacher.lastActive
          ? teacher.lastActive.toISOString()
          : "Never",
      };
    });

    return NextResponse.json({
      success: true,
      teachers: enrichedTeachers,
    });
  } catch (error: any) {
    console.error("API Error in get-teachers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve teacher records" },
      { status: 500 }
    );
  }
}