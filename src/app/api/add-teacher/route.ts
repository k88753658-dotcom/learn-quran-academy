import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";

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
    const { name, email, role, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: Name, Email, or Password." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address format." },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, error: "Security risk: Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const safeEmail = String(email).toLowerCase().trim();
    const safeRole = role === "admin" ? "admin" : "teacher";
    const formattedName = String(name)
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());

    // 3. Check existing user in database
    const existing = await prisma.user.findUnique({
      where: { email: safeEmail },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A user account with this email address already exists." },
        { status: 409 }
      );
    }

    // 4. Provision User, Account, and Profile in Prisma
    const hashedPassword = await hashPassword(String(password));

    const { newTeacher } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: formattedName,
          email: safeEmail,
          emailVerified: false,
          role: safeRole,
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
          name: formattedName,
          email: safeEmail,
          role: safeRole as any,
          isProfileComplete: true,
        },
      });

      return { newTeacher: user };
    });

    return NextResponse.json({
      success: true,
      message: `${formattedName} has been successfully added to the staff network!`,
      teacherId: newTeacher.id,
    });
  } catch (error: any) {
    console.error("API Error in add-teacher:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create teacher account" },
      { status: 500 }
    );
  }
}