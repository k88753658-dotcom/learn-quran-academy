import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
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

    if (!profile || profile.role !== "teacher") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Teacher access required" },
        { status: 403 }
      );
    }

    await prisma.profile.update({
      where: { id: userId },
      data: { lastActive: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Teacher Activity Ping Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to ping activity" },
      { status: 500 }
    );
  }
}
