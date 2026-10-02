import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Notifications API Route
 * Handlers:
 *   - GET: fetch notifications for user/student
 *          prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
 *   - PATCH: mark notification as read / resolved
 *          prisma.notification.update({ where: { id }, data: { isRead: true } })
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const studentId = searchParams.get("studentId") || undefined;

    let targetStudentId = studentId || userId;

    // If userId was passed, check if it maps to a student record via Profile ID or Student ID
    if (userId) {
      const student = await prisma.student.findFirst({
        where: {
          OR: [{ id: userId }, { profileId: userId }],
        },
      });
      if (student) {
        targetStudentId = student.id;
      }
    }

    // Build filter: if user/student specified, return Global + Targeted for this student; otherwise Global only
    const where: any = targetStudentId
      ? {
          isActive: true,
          OR: [
            { type: "Global" },
            { type: "Targeted", targetStudentId },
          ],
        }
      : { isActive: true, type: "Global" };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    console.error("Notifications Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = body.id || req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Mark notification as read (represented in database schema by isActive: false)
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error: any) {
    console.error("Notification Update Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
