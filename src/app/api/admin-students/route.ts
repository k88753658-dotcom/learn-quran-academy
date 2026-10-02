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

    // 2. Fetch full student roster with relational metrics
    const students = await prisma.student.findMany({
      include: {
        billing: true,
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attendances: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Serialize with dual property aliases for frontend rendering
    const sanitizedStudents = students.map((s) => ({
      id: s.id,
      _id: s.id,
      profileId: s.profileId,
      profile_id: s.profileId,
      studentName: s.studentName,
      student_name: s.studentName,
      parentName: s.parentName,
      parent_name: s.parentName,
      course: s.course,
      enrolled: s.enrolled,
      progress: s.progress,
      lastAssignment: s.lastAssignment,
      last_assignment: s.lastAssignment,
      liveClassroomLink: s.liveClassroomLink,
      live_classroom_link: s.liveClassroomLink,
      teacherId: s.teacherId,
      teacher_id: s.teacherId,
      teacher: s.teacher
        ? {
            id: s.teacher.id,
            _id: s.teacher.id,
            name: s.teacher.name,
            email: s.teacher.email,
          }
        : null,
      billing: s.billing
        ? {
            id: s.billing.id,
            status: s.billing.status,
            amountDue: s.billing.amountDue,
            lastPaymentDate: s.billing.lastPaymentDate
              ? s.billing.lastPaymentDate.toISOString().split("T")[0]
              : "N/A",
          }
        : {
            status: "Pending",
            amountDue: "3000 PKR",
            lastPaymentDate: "N/A",
          },
      attendanceCount: s.attendances.length,
      presentCount: s.attendances.filter((a) => a.status === "Present").length,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      students: sanitizedStudents,
    });
  } catch (error: any) {
    console.error("API Error in admin-students:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve admin student roster" },
      { status: 500 }
    );
  }
}
