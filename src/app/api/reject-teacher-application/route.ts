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
        { success: false, error: "Unauthorized: Admin privileges required." },
        { status: 403 }
      );
    }

    // 2. Validate request payload
    const body = await req.json().catch(() => ({}));
    const { applicationId, adminNotes } = body;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "Missing required applicationId parameter." },
        { status: 400 }
      );
    }

    // 3. Find application
    const application = await prisma.teacherApplication.findUnique({
      where: { id: String(applicationId) },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Teacher application not found." },
        { status: 404 }
      );
    }

    // 4. Mark status rejected
    await prisma.teacherApplication.update({
      where: { id: application.id },
      data: {
        status: "rejected",
        adminNotes: adminNotes ? String(adminNotes).trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Teacher application rejected.",
    });
  } catch (error: any) {
    console.error("API Error in reject-teacher-application:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reject teacher application" },
      { status: 500 }
    );
  }
}
