import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Active session required." },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Credentials missing." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const sessionProfile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (
      !sessionProfile ||
      (sessionProfile.email !== cleanEmail && sessionProfile.role !== "admin")
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Access denied to requested profile." },
        { status: 403 }
      );
    }

    // 1. Fetch user profile from Prisma
    const profile = await prisma.profile.findUnique({ where: { email: cleanEmail } });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Invalid login credentials." },
        { status: 401 }
      );
    }

    // 2. Return data matching the legacy API format with zero Supabase dependencies
    if (profile.role === "student") {
      const student = await prisma.student.findFirst({
        where: {
          OR: [{ profileId: profile.id }, { id: profile.id }],
        },
        include: { billing: true },
      });

      if (!student) {
        return NextResponse.json(
          { success: false, error: "Student record not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        role: "student",
        user: {
          id: student.id,
          _id: student.id,
          studentName: student.studentName,
          parentName: student.parentName,
          email: profile.email,
          course: student.course,
          enrolled: student.enrolled,
          progress: student.progress ?? 0,
          attendanceRate: 100,
          liveClassroomLink: student.liveClassroomLink || "",
          lastAssignment: student.lastAssignment || "No assignments yet.",
          billing: student.billing || { status: "Trial Phase" },
        },
      });
    }

    // If Admin or Teacher
    return NextResponse.json({
      success: true,
      role: profile.role,
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
      },
    });
  } catch (error: any) {
    console.error("LOGIN_ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error during authentication." },
      { status: 500 }
    );
  }
}