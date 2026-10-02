import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // --- 1. SECURE AUTHORIZATION ---
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Staff privileges required to assign tasks." }, 
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Staff privileges required to assign tasks." }, 
        { status: 403 }
      );
    }

    const body = await req.json();
    const { studentId, assignment } = body;

    // --- 2. BASELINE VALIDATION ---
    if (!studentId || !assignment) {
      return NextResponse.json(
        { success: false, error: "Missing Student ID or Task Text Data." }, 
        { status: 400 }
      );
    }

    // --- 3. DATA SANITIZATION & NORMALIZATION ---
    const safeAssignment = typeof assignment === "string" ? assignment.trim() : "";

    // --- 4. VERIFY TARGET RECORD ---
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Target student record not found." }, 
        { status: 404 }
      );
    }

    if (profile.role === "teacher" && student.teacherId && student.teacherId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Cannot assign tasks to students of other teachers." }, 
        { status: 403 }
      );
    }

    // --- 5. EXECUTE SECURE DATABASE UPDATE ---
    await prisma.student.update({
      where: { id: studentId },
      data: { lastAssignment: safeAssignment },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Homework log updated successfully!" 
    });

  } catch (error: any) {
    console.error("API Error in assign-task:", error.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error assigning task." }, 
      { status: 500 }
    );
  }
}