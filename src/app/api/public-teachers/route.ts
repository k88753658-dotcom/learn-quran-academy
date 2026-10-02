import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const teachers = await prisma.profile.findMany({
      where: { role: "teacher" },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        specializations: true,
        qualification: true,
        experienceYears: true,
        profilePhotoUrl: true,
      },
    });

    return NextResponse.json({ success: true, teachers });
  } catch (error: any) {
    console.error("Public Teachers Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch teachers." },
      { status: 500 }
    );
  }
}
