import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Valid AttendanceStatus values matching Prisma enum
const VALID_STATUSES = ["Present", "Absent", "Late", "Excused"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

// ==========================================
// POST: Mark a student attendance record
// ==========================================
export async function POST(req: NextRequest) {
  try {
    // 1. Authorize staff user (admin or teacher)
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

    // 2. Validate inputs and status enum
    if (!studentId || !status || !VALID_STATUSES.includes(status as ValidStatus)) {
      return NextResponse.json(
        { success: false, error: "Missing required fields or invalid status." },
        { status: 400 }
      );
    }

    // 3. Normalize date to UTC midnight for @db.Date compound unique constraint [studentId, date]
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setUTCHours(0, 0, 0, 0);

    // 4. Upsert attendance record
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
    console.error("Attendance POST Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error logging attendance." },
      { status: 500 }
    );
  }
}

// ==========================================
// GET: Fetch last 30 days of attendance logs
// ==========================================
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Staff privileges required to view academy logs." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const specificStudentId = searchParams.get("studentId");

    // Calculate cutoff date (30 days ago, midnight UTC)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

    const logs = await prisma.attendance.findMany({
      where: {
        date: { gte: thirtyDaysAgo },
        ...(specificStudentId ? { studentId: specificStudentId } : {}),
      },
      include: {
        markedBy: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    const safeLogs = logs.map((log) => ({
      id: log.id,
      _id: log.id,
      studentId: log.studentId,
      date: log.date.toISOString().split("T")[0],
      status: log.status,
      markedBy: log.markedBy?.name || "System",
    }));

    return NextResponse.json({
      success: true,
      logs: safeLogs,
    });
  } catch (error: any) {
    console.error("Attendance GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error fetching attendance logs." },
      { status: 500 }
    );
  }
}