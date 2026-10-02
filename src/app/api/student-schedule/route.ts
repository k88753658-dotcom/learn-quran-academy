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
            whatsapp: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      schedule: {
        course: student.course || "General Tajweed",
        teacher: student.teacher || null,
        liveClassroomLink: student.liveClassroomLink || "",
        enrolled: student.enrolled,
      },
    });
  } catch (error: any) {
    console.error("Student Schedule Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student schedule" },
      { status: 500 }
    );
  }
}
