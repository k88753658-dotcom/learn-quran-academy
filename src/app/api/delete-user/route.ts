import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

async function handleDeleteUser(req: NextRequest) {
  try {
    // 1. Authorize admin caller
    const session = await getServerSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access: Please log in." },
        { status: 401 }
      );
    }

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

    // 2. Extract target user/profile ID
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const targetId = body.userId || body.id || searchParams.get("userId") || searchParams.get("id");

    if (!targetId) {
      return NextResponse.json(
        { success: false, error: "Missing required user ID parameter." },
        { status: 400 }
      );
    }

    const cleanTargetId = String(targetId);

    // Prevent self-deletion
    if (cleanTargetId === userId) {
      return NextResponse.json(
        { success: false, error: "Security restriction: Admins cannot delete their own active account." },
        { status: 400 }
      );
    }

    // 3. Resolve target user or student
    let userIdToDelete: string | null = null;

    const user = await prisma.user.findUnique({
      where: { id: cleanTargetId },
    });

    if (user) {
      userIdToDelete = user.id;
    } else {
      const profile = await prisma.profile.findUnique({
        where: { id: cleanTargetId },
      });

      if (profile) {
        userIdToDelete = profile.id;
      } else {
        const student = await prisma.student.findUnique({
          where: { id: cleanTargetId },
        });

        if (!student) {
          return NextResponse.json(
            { success: false, error: "Target user record not found." },
            { status: 404 }
          );
        }

        if (student.profileId) {
          userIdToDelete = student.profileId;
        } else {
          await prisma.student.delete({
            where: { id: cleanTargetId },
          });
          return NextResponse.json({
            success: true,
            message: "Student record deleted successfully.",
          });
        }
      }
    }

    // 4. Cascade delete via Prisma User
    // Deleting User cascades automatically to Profile, Student, Session, Account, Billing, etc.
    if (userIdToDelete) {
      const userExists = await prisma.user.findUnique({
        where: { id: userIdToDelete },
      });

      if (userExists) {
        await prisma.user.delete({
          where: { id: userIdToDelete },
        });
      } else {
        await prisma.profile.delete({
          where: { id: userIdToDelete },
        }).catch(() => null);
      }
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error: any) {
    console.error("API Error in delete-user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user account" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  return handleDeleteUser(req);
}

export async function POST(req: NextRequest) {
  return handleDeleteUser(req);
}
