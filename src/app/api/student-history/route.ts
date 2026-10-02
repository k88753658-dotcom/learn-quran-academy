import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    let studentId = searchParams.get("studentId") || searchParams.get("id");

    if (!studentId) {
      const selfStudent = await prisma.student.findFirst({
        where: {
          OR: [{ id: userId }, { profileId: userId }],
        },
        select: { id: true },
      });
      if (selfStudent) {
        studentId = selfStudent.id;
      }
    }

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID required" },
        { status: 400 }
      );
    }

    const history = await prisma.attendance.findMany({
      where: { studentId },
      include: {
        markedBy: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    const safeHistory = history.map((record) => ({
      id: record.id,
      _id: record.id,
      studentId: record.studentId,
      date: record.date.toISOString().split("T")[0],
      status: record.status,
      markedBy: record.markedBy?.name || "Teacher",
    }));

    return NextResponse.json({
      success: true,
      history: safeHistory,
      attendances: safeHistory,
    });
  } catch (error: any) {
    console.error("Student History Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student history" },
      { status: 500 }
    );
  }
}

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

    const body = await req.json().catch(() => ({}));
    let studentId = body.studentId || body.id;

    if (!studentId) {
      const selfStudent = await prisma.student.findFirst({
        where: {
          OR: [{ id: userId }, { profileId: userId }],
        },
        select: { id: true },
      });
      if (selfStudent) {
        studentId = selfStudent.id;
      }
    }

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID required" },
        { status: 400 }
      );
    }

    const history = await prisma.attendance.findMany({
      where: { studentId },
      include: {
        markedBy: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    const safeHistory = history.map((record) => ({
      id: record.id,
      _id: record.id,
      studentId: record.studentId,
      date: record.date.toISOString().split("T")[0],
      status: record.status,
      markedBy: record.markedBy?.name || "Teacher",
    }));

    return NextResponse.json({
      success: true,
      history: safeHistory,
      attendances: safeHistory,
    });
  } catch (error: any) {
    console.error("Student History Post Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student history" },
      { status: 500 }
    );
  }
}
