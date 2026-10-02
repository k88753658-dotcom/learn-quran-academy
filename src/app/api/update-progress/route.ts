import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { studentId, bookType, surahName, verseNumber } = await req.json();

    if (!studentId) {
      return NextResponse.json({ success: false, error: "Student ID missing" }, { status: 400 });
    }

    const lastAssignment = `Book: ${bookType || "N/A"} | Surah: ${surahName || "N/A"} | Ayah: ${verseNumber || "N/A"}`;

    const whereClause = profile.role === "teacher"
      ? { id: studentId, teacherId: userId }
      : { id: studentId };

    const student = await prisma.student.findFirst({
      where: whereClause,
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found or unauthorized" }, { status: 404 });
    }

    await prisma.student.update({
      where: { id: student.id },
      data: { lastAssignment },
    });

    return NextResponse.json({ success: true, message: "Progress updated successfully" });

  } catch (error: any) {
    console.error("API Error updating progress:", error.message);
    return NextResponse.json({ success: false, error: "Failed to update progress." }, { status: 500 });
  }
}
