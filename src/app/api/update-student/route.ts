import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize staff user (teacher or admin)
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
        { success: false, error: "Unauthorized access: Staff privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { studentId, liveClassroomLink, progress, lastAssignment } = body;

    // 2. Validate Student ID
    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Missing required Student ID." },
        { status: 400 }
      );
    }

    // 3. Verify target student exists
    const targetStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!targetStudent) {
      return NextResponse.json(
        { success: false, error: "Target student record not found." },
        { status: 404 }
      );
    }

    // Verify teacher can only mutate their own assigned student unless admin
    if (profile.role === "teacher" && targetStudent.teacherId !== profile.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You are not assigned to this student." },
        { status: 403 }
      );
    }

    // 4. Data sanitization & progress boundary clamping (0-100)
    const safeLink = typeof liveClassroomLink === "string" ? liveClassroomLink.trim() : targetStudent.liveClassroomLink;
    const safeAssignment = typeof lastAssignment === "string" ? lastAssignment.trim() : targetStudent.lastAssignment;
    const parsedProgress = Number(progress);
    const safeProgress = !isNaN(parsedProgress) ? Math.max(0, Math.min(parsedProgress, 100)) : targetStudent.progress;

    // 5. Update student record in Prisma
    await prisma.student.update({
      where: { id: studentId },
      data: {
        liveClassroomLink: safeLink,
        progress: safeProgress,
        lastAssignment: safeAssignment,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student metrics successfully synchronized.",
    });
  } catch (error: any) {
    console.error("API Error in update-student:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during update." },
      { status: 500 }
    );
  }
}