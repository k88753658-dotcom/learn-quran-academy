import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, date, notes } = body;

    // Validate required studentId
    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "studentId is required" },
        { status: 400 }
      );
    }

    // Standardize attendance date to midnight UTC for @@unique([studentId, date])
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setUTCHours(0, 0, 0, 0);

    // Guard against duplicate check-in on the same date
    const existing = await prisma.attendance.findUnique({
      where: {
        studentId_date: {
          studentId,
          date: attendanceDate,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already marked for today!" },
        { status: 400 }
      );
    }

    // Insert attendance record: status 'Present', markedById left null or valid profile id (never literal string "student")
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        date: attendanceDate,
        status: "Present",
        markedById: null, // Self attendance
      },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance marked successfully!",
      attendance,
    });
  } catch (error: any) {
    console.error("Self Attendance Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record attendance" },
      { status: 500 }
    );
  }
}