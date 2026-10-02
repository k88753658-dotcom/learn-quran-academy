import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";
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

    // 2. Extract & validate payload
    const body = await req.json().catch(() => ({}));
    const { studentName, email, parentName, course, teacherId, password } = body;

    if (!studentName || !email || !course) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: studentName, email, and course are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address format." },
        { status: 400 }
      );
    }

    const securePassword =
      password && String(password).length >= 6
        ? String(password)
        : crypto.randomBytes(6).toString("base64url").slice(0, 10) + "!A1";

    // 3. Check for existing user
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A user account with this email address already exists." },
        { status: 409 }
      );
    }

    // 4. Verify teacher if provided
    let verifiedTeacherId: string | null = null;
    if (teacherId && teacherId !== "unassigned") {
      const teacher = await prisma.profile.findUnique({
        where: { id: String(teacherId) },
        select: { id: true, role: true },
      });
      if (teacher && teacher.role === "teacher") {
        verifiedTeacherId = teacher.id;
      }
    }

    // 5. Transactional Database Provisioning
    const hashedPassword = await hashPassword(securePassword);

    const { createdStudent } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: String(studentName).trim(),
          email: cleanEmail,
          emailVerified: false,
          role: "student",
        },
      });

      await tx.account.create({
        data: {
          accountId: user.id,
          providerId: "credential",
          userId: user.id,
          password: hashedPassword,
        },
      });

      await tx.profile.create({
        data: {
          id: user.id,
          name: String(studentName).trim(),
          email: cleanEmail,
          role: "student",
          isProfileComplete: true,
        },
      });

      const student = await tx.student.create({
        data: {
          profileId: user.id,
          studentName: String(studentName).trim(),
          parentName: parentName ? String(parentName).trim() : null,
          course: String(course).trim(),
          teacherId: verifiedTeacherId,
          enrolled: true,
          progress: 0,
          lastAssignment: "Welcome! Your student account has been created by the administration.",
        },
      });

      await tx.billing.create({
        data: {
          studentId: student.id,
          amountDue: "3000 PKR",
          status: "Pending",
        },
      });

      return { createdStudent: student };
    });

    return NextResponse.json({
      success: true,
      message: "Student account successfully created!",
      studentId: createdStudent.id,
      temporaryPassword: securePassword,
    });
  } catch (error: any) {
    console.error("API Error in add-student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create student record" },
      { status: 500 }
    );
  }
}
