import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Authorize admin caller
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

    if (!callerProfile || callerProfile.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required." },
        { status: 403 }
      );
    }

    // 2. Fetch all teacher applications ordered by submission date
    const applications = await prisma.teacherApplication.findMany({
      orderBy: { createdAt: "desc" },
    });

    // 3. Serialize with dual property aliases for frontend rendering
    const safeApplications = applications.map((app) => ({
      id: app.id,
      _id: app.id,
      name: app.name,
      email: app.email,
      whatsapp: app.whatsapp,
      country: app.country,
      qualification: app.qualification,
      specializations: app.specializations,
      experienceYears: app.experienceYears,
      experience_years: app.experienceYears,
      bio: app.bio,
      status: app.status,
      adminNotes: app.adminNotes,
      admin_notes: app.adminNotes,
      createdAt: app.createdAt,
      created_at: app.createdAt,
      updatedAt: app.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      applications: safeApplications,
    });
  } catch (error: any) {
    console.error("API Error in get-teacher-applications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve teacher applications" },
      { status: 500 }
    );
  }
}
