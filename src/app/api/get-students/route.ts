import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
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

    // 2. Verify staff role privileges
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access: Privileges required." },
        { status: 403 }
      );
    }

    // 3. Build scoped where query
    const whereClause: any = {};

    if (profile.role === "teacher") {
      whereClause.teacherId = profile.id;
    } else if (profile.role === "admin") {
      const { searchParams } = new URL(req.url);
      const teacherId = searchParams.get("teacherId");
      if (teacherId) {
        whereClause.teacherId = teacherId;
      }
    }

    // 4. Fetch students with associated billing
    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        billing: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 5. Serialize data with dual properties for frontend UI compatibility
    const sanitizedStudents = students.map((student) => ({
      id: student.id,
      _id: student.id,
      profileId: student.profileId,
      profile_id: student.profileId,
      studentName: student.studentName,
      student_name: student.studentName,
      parentName: student.parentName,
      parent_name: student.parentName,
      course: student.course,
      enrolled: student.enrolled,
      progress: student.progress,
      lastAssignment: student.lastAssignment,
      last_assignment: student.lastAssignment,
      liveClassroomLink: student.liveClassroomLink,
      live_classroom_link: student.liveClassroomLink,
      teacherId: student.teacherId,
      teacher_id: student.teacherId,
      billing: student.billing
        ? {
            id: student.billing.id,
            status: student.billing.status,
            amountDue: student.billing.amountDue,
            lastPaymentDate: student.billing.lastPaymentDate
              ? student.billing.lastPaymentDate.toISOString().split("T")[0]
              : "N/A",
          }
        : {
            status: "Pending",
            amountDue: "3000 PKR",
            lastPaymentDate: "N/A",
          },
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      students: sanitizedStudents,
    });
  } catch (error: any) {
    console.error("API Error in get-students:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve student records" },
      { status: 500 }
    );
  }
}