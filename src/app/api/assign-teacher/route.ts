import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
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
        { success: false, error: "Unauthorized: Admin privileges required to assign teachers." },
        { status: 403 }
      );
    }

    // 2. Validate required request payload
    const body = await req.json().catch(() => ({}));
    const { studentId, teacherId } = body;

    if (!studentId || !teacherId) {
      return NextResponse.json(
        { success: false, error: "Missing required Student ID or Teacher ID." },
        { status: 400 }
      );
    }

    // 3. Verify target student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Target student record could not be found." },
        { status: 404 }
      );
    }

    // 4. Validate target teacher if assigning
    const cleanTeacherId =
      teacherId && teacherId !== "unassigned" && teacherId !== "null"
        ? String(teacherId)
        : null;

    if (cleanTeacherId) {
      const teacher = await prisma.profile.findUnique({
        where: { id: cleanTeacherId },
        select: { id: true, role: true },
      });

      if (!teacher) {
        return NextResponse.json(
          { success: false, error: "Target teacher record not found." },
          { status: 404 }
        );
      }
    }

    // 5. Update student assignment in Prisma
    await prisma.student.update({
      where: { id: studentId },
      data: {
        teacherId: cleanTeacherId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student successfully assigned to teacher.",
    });
  } catch (error: any) {
    console.error("API Error in assign-teacher:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error processing assignment." },
      { status: 500 }
    );
  }
}