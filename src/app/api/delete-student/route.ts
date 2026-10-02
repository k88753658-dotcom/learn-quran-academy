import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
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
        { success: false, error: "Unauthorized: Admin privileges required to delete records." },
        { status: 403 }
      );
    }

    // 2. Extract target student ID from body or query params
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const id = body.id || searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required Student ID." },
        { status: 400 }
      );
    }

    // 3. Find target student record
    const student = await prisma.student.findUnique({
      where: { id: String(id) },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Target student record could not be found." },
        { status: 404 }
      );
    }

    const profileIdToDelete = student.profileId;

    // 4. Delete user record with full cascade if user/profile exists, otherwise delete student record
    if (profileIdToDelete) {
      const userExists = await prisma.user.findUnique({
        where: { id: profileIdToDelete },
      });

      if (userExists) {
        await prisma.user.delete({
          where: { id: profileIdToDelete },
        });
      } else {
        await prisma.student.delete({
          where: { id: String(id) },
        });
        await prisma.profile.delete({
          where: { id: profileIdToDelete },
        }).catch(() => null);
      }
    } else {
      await prisma.student.delete({
        where: { id: String(id) },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Student and all associated records permanently deleted.",
    });
  } catch (error: any) {
    console.error("API Error in delete-student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete student record" },
      { status: 500 }
    );
  }
}