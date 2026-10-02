import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["Present", "Absent", "Late", "Excused"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

export async function POST(req: NextRequest) {
  try {
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

    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Staff privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { studentId, status, date } = body;

    if (!studentId || !status || !date) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status as ValidStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: targetDate,
        },
      },
      update: {
        status: status as ValidStatus,
        markedById: userId,
      },
      create: {
        studentId,
        date: targetDate,
        status: status as ValidStatus,
        markedById: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Student successfully marked as ${status}.`,
      attendance: {
        id: attendance.id,
        _id: attendance.id,
        studentId: attendance.studentId,
        date: attendance.date.toISOString().split("T")[0],
        status: attendance.status,
      },
    });
  } catch (error: any) {
    console.error("Mark Attendance API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error logging attendance." },
      { status: 500 }
    );
  }
}