import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate caller session
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    // 2. Fetch active announcements scoped to Global or Student Targeted
    const announcements = await prisma.notification.findMany({
      where: {
        isActive: true,
        ...(studentId
          ? {
              OR: [
                { type: "Global" },
                { type: "Targeted", targetStudentId: studentId },
              ],
            }
          : { type: "Global" }),
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Serialize with dual property aliases for frontend rendering
    const safeAnnouncements = announcements.map((announcement) => ({
      id: announcement.id,
      _id: announcement.id,
      title: announcement.title,
      text: announcement.text,
      type: announcement.type,
      targetStudentId: announcement.targetStudentId,
      target_student_id: announcement.targetStudentId,
      isActive: announcement.isActive,
      is_active: announcement.isActive,
      publisherRole: announcement.publisherRole,
      publisher_role: announcement.publisherRole,
      createdAt: announcement.createdAt,
      created_at: announcement.createdAt,
      updatedAt: announcement.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      announcements: safeAnnouncements,
    });
  } catch (error: any) {
    console.error("Announcements API Error in get-active-announcements:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching announcements." },
      { status: 500 }
    );
  }
}