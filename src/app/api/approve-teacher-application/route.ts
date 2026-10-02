import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";
import { Resend } from "resend";
import crypto from "crypto";

export async function POST(req: NextRequest) {
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

    // 2. Validate payload
    const body = await req.json().catch(() => ({}));
    const { applicationId, action, adminNotes } = body;

    if (!applicationId || !action) {
      return NextResponse.json(
        { success: false, error: "Missing applicationId or action." },
        { status: 400 }
      );
    }

    const normalizedAction = String(action).toLowerCase();
    if (normalizedAction !== "approve" && normalizedAction !== "reject") {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be 'approve' or 'reject'." },
        { status: 400 }
      );
    }

    // 3. Fetch target application
    const application = await prisma.teacherApplication.findUnique({
      where: { id: String(applicationId) },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found." },
        { status: 404 }
      );
    }

    if (application.status !== "pending") {
      return NextResponse.json(
        { success: false, error: `Application already ${application.status}.` },
        { status: 409 }
      );
    }

    // 4. Handle Reject Flow
    if (normalizedAction === "reject") {
      await prisma.teacherApplication.update({
        where: { id: application.id },
        data: {
          status: "rejected",
          adminNotes: adminNotes ? String(adminNotes) : null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Application rejected.",
      });
    }

    // 5. Handle Approve Flow
    const generatedPassword =
      crypto.randomBytes(6).toString("base64url").slice(0, 10) + "!A1";
    const hashedPassword = await hashPassword(generatedPassword);
    const safeEmail = application.email.toLowerCase().trim();
    const formattedName = application.name.trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: safeEmail },
    });

    let teacherUserId = "";

    await prisma.$transaction(async (tx) => {
      let uId: string;
      if (existingUser) {
        uId = existingUser.id;
        await tx.user.update({
          where: { id: uId },
          data: { role: "teacher" },
        });

        const existingAccount = await tx.account.findFirst({
          where: { userId: uId, providerId: "credential" },
        });

        if (existingAccount) {
          await tx.account.update({
            where: { id: existingAccount.id },
            data: { password: hashedPassword },
          });
        } else {
          await tx.account.create({
            data: {
              accountId: uId,
              providerId: "credential",
              userId: uId,
              password: hashedPassword,
            },
          });
        }
      } else {
        const newUser = await tx.user.create({
          data: {
            name: formattedName,
            email: safeEmail,
            emailVerified: true,
            role: "teacher",
          },
        });
        uId = newUser.id;

        await tx.account.create({
          data: {
            accountId: uId,
            providerId: "credential",
            userId: uId,
            password: hashedPassword,
          },
        });
      }

      teacherUserId = uId;

      await tx.profile.upsert({
        where: { id: uId },
        update: {
          name: formattedName,
          email: safeEmail,
          role: "teacher",
          whatsapp: application.whatsapp,
          qualification: application.qualification,
          specializations: application.specializations,
          experienceYears: application.experienceYears,
          bio: application.bio,
          isProfileComplete: true,
        },
        create: {
          id: uId,
          name: formattedName,
          email: safeEmail,
          role: "teacher",
          whatsapp: application.whatsapp,
          qualification: application.qualification,
          specializations: application.specializations,
          experienceYears: application.experienceYears,
          bio: application.bio,
          isProfileComplete: true,
        },
      });

      await tx.teacherApplication.update({
        where: { id: application.id },
        data: {
          status: "approved",
          adminNotes: adminNotes ? String(adminNotes) : null,
        },
      });
    });

    // Send Welcome Email if Resend key configured
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Learn Quran Academy <admin@resend.dev>",
          to: application.email,
          subject: "Congratulations! Your Teacher Application has been Approved",
          html: `<p>Dear ${application.name},</p><p>Welcome to Learn Quran Academy. Your teacher account has been provisioned.</p><p>Email: ${application.email}<br/>Temporary Password: ${generatedPassword}</p>`,
        });
      } catch (emailErr) {
        console.warn("Teacher welcome email dispatch failed (non-fatal):", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Applicant approved! Teacher profile provisioned.",
      teacherId: teacherUserId,
      temporaryPassword: generatedPassword,
    });
  } catch (error: any) {
    console.error("API Error in approve-teacher-application:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process teacher application" },
      { status: 500 }
    );
  }
}
