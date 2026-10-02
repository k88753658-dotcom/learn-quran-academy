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

    if (!profile || profile.role !== "teacher") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Teacher access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { bio, whatsapp, specializations, profilePhotoUrl } = body;

    if (!bio || !whatsapp || !specializations?.length) {
      return NextResponse.json(
        { success: false, error: "Bio, WhatsApp, and Specializations are required." },
        { status: 400 }
      );
    }

    await prisma.profile.update({
      where: { id: userId },
      data: {
        bio: bio.trim(),
        whatsapp: whatsapp.trim(),
        specializations: Array.isArray(specializations) ? specializations : [specializations],
        profilePhotoUrl: profilePhotoUrl || null,
        isProfileComplete: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
    });
  } catch (error: any) {
    console.error("Update Teacher Profile Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
