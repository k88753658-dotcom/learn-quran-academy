import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Teacher access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { availability, days, timeSlots } = body;

    const availabilitySummary = [
      availability ? `Availability: ${availability}` : "",
      Array.isArray(days) && days.length ? `Days: ${days.join(", ")}` : "",
      Array.isArray(timeSlots) && timeSlots.length ? `Slots: ${timeSlots.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const updatedBio = profile.bio
      ? `${profile.bio.split("\n\n[Availability]")[0]}\n\n[Availability]\n${availabilitySummary || availability || "Flexible"}`
      : `[Availability]\n${availabilitySummary || availability || "Flexible"}`;

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        bio: updatedBio,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Teacher availability recorded successfully",
      availability: availabilitySummary || availability || "Flexible",
    });
  } catch (error: any) {
    console.error("Add Availability Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update availability" },
      { status: 500 }
    );
  }
}
