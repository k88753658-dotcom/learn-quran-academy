import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize staff caller (Admin or Teacher)
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

    if (
      !callerProfile ||
      (callerProfile.role !== "admin" && callerProfile.role !== "teacher")
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Staff privileges required to publish announcements." },
        { status: 403 }
      );
    }

    // 2. Validate request body
    const body = await req.json().catch(() => ({}));
    const { title, text, targetStudentId, type } = body;

    if (!title || !text || !type) {
      return NextResponse.json(
        { success: false, error: "Required notification content fields are missing." },
        { status: 400 }
      );
    }

    if (!["Global", "Targeted"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid announcement type. Must be 'Global' or 'Targeted'." },
        { status: 400 }
      );
    }

    if (type === "Targeted" && !targetStudentId) {
      return NextResponse.json(
        { success: false, error: "Valid Target Student ID is required for Targeted announcements." },
        { status: 400 }
      );
    }

    // 3. If Targeted, verify student existence
    if (type === "Targeted" && targetStudentId) {
      const targetStudent = await prisma.student.findUnique({
        where: { id: String(targetStudentId) },
        select: { id: true },
      });

      if (!targetStudent) {
        return NextResponse.json(
          { success: false, error: "Target student not found." },
          { status: 404 }
        );
      }
    }

    // 4. Create notification record in Prisma
    const notification = await prisma.notification.create({
      data: {
        title: String(title).trim(),
        text: String(text).trim(),
        type: type as "Global" | "Targeted",
        targetStudentId: type === "Targeted" ? String(targetStudentId) : null,
        publisherRole: callerProfile.role,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Announcement successfully published!",
      notificationId: notification.id,
    });
  } catch (error: any) {
    console.error("API Error in publish-announcement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish announcement" },
      { status: 500 }
    );
  }
}