import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      parentName,
      email,
      whatsappNumber,
      studentName,
      studentAge,
      selectedCourse,
      password,
      country,
      specialRequirements,
    } = body;

    // Validate required fields
    if (
      !parentName ||
      !email ||
      !whatsappNumber ||
      !studentName ||
      !studentAge ||
      !selectedCourse
    ) {
      return NextResponse.json(
        { success: false, error: "Required parameters are missing." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const formattedStudentName = String(studentName).trim();
    const formattedParentName = String(parentName).trim();

    // 1. Check existing user in database
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { profile: true },
    });

    if (existingUser && existingUser.profile) {
      return NextResponse.json(
        { success: false, error: "A user account with this email address already exists." },
        { status: 400 }
      );
    }

    if (!existingUser && !password) {
      return NextResponse.json(
        { success: false, error: "Password is required to create a new user account." },
        { status: 400 }
      );
    }

    let userId = "";
    let studentId = "";

    if (!existingUser) {
      const hashedPassword = await hashPassword(String(password));

      const created = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: formattedStudentName,
            email: cleanEmail,
            emailVerified: false,
            role: "student",
          },
        });

        await tx.account.create({
          data: {
            accountId: newUser.id,
            providerId: "credential",
            userId: newUser.id,
            password: hashedPassword,
          },
        });

        await tx.profile.create({
          data: {
            id: newUser.id,
            name: formattedStudentName,
            email: cleanEmail,
            role: "student",
            whatsapp: whatsappNumber ? String(whatsappNumber).trim() : null,
            isProfileComplete: true,
          },
        });

        const newStudent = await tx.student.create({
          data: {
            profileId: newUser.id,
            studentName: formattedStudentName,
            parentName: formattedParentName,
            course: selectedCourse,
            enrolled: false,
            progress: 0,
            lastAssignment: "Welcome! Complete your payment to activate your student terminal.",
          },
        });

        await tx.billing.create({
          data: {
            studentId: newStudent.id,
            amountDue: "3000 PKR",
            status: "Pending",
          },
        });

        return { user: newUser, student: newStudent };
      });

      userId = created.user.id;
      studentId = created.student.id;
    } else {
      userId = existingUser.id;

      const created = await prisma.$transaction(async (tx) => {
        await tx.profile.upsert({
          where: { id: existingUser.id },
          update: {
            name: formattedStudentName,
            email: cleanEmail,
            role: "student",
            whatsapp: whatsappNumber ? String(whatsappNumber).trim() : null,
            isProfileComplete: true,
          },
          create: {
            id: existingUser.id,
            name: formattedStudentName,
            email: cleanEmail,
            role: "student",
            whatsapp: whatsappNumber ? String(whatsappNumber).trim() : null,
            isProfileComplete: true,
          },
        });

        const newStudent = await tx.student.create({
          data: {
            profileId: existingUser.id,
            studentName: formattedStudentName,
            parentName: formattedParentName,
            course: selectedCourse,
            enrolled: false,
            progress: 0,
            lastAssignment: "Welcome! Complete your payment to activate your student terminal.",
          },
        });

        await tx.billing.create({
          data: {
            studentId: newStudent.id,
            amountDue: "3000 PKR",
            status: "Pending",
          },
        });

        return { student: newStudent };
      });

      studentId = created.student.id;
    }

    // 2. Admin Email Notification (isolated try/catch so SMTP delay never blocks student onboarding)
    try {
      await resend.emails.send({
        from: "Academy Registrations <onboarding@resend.dev>",
        to: "learnquranacaademy.me@gmail.com",
        subject: `🚨 New Registration: ${formattedStudentName}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #4A3C31; max-width: 600px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #7A9D8C; margin-bottom: 5px;">New Student Enrollment! 🎓</h2>
            <p style="color: #6b7280; font-size: 14px; margin-top: 0;">A new family has just applied for a free trial.</p>
            
            <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
            
            <h3 style="margin-bottom: 10px;">Contact Details</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 8px;"><strong>Parent:</strong> ${parentName}</li>
              <li style="margin-bottom: 8px;"><strong>WhatsApp:</strong> <a href="https://wa.me/${String(whatsappNumber).replace(/[^0-9]/g, "")}" style="color: #C5A880; font-weight: bold;">${whatsappNumber}</a></li>
              <li style="margin-bottom: 8px;"><strong>Email:</strong> ${cleanEmail}</li>
              <li style="margin-bottom: 8px;"><strong>Country:</strong> ${country || "Not provided"}</li>
            </ul>

            <h3 style="margin-top: 25px; margin-bottom: 10px;">Student Details</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 8px;"><strong>Student:</strong> ${formattedStudentName} (Age: ${studentAge})</li>
              <li style="margin-bottom: 8px;"><strong>Course:</strong> <span style="background-color: #7A9D8C; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px;">${selectedCourse}</span></li>
              <li style="margin-bottom: 8px;"><strong>Requirements:</strong> ${specialRequirements || "None"}</li>
            </ul>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send admin email:", emailError);
    }

    return NextResponse.json({
      success: true,
      studentId,
      userId,
    });
  } catch (error: any) {
    console.error("--- REGISTRATION EXCEPTION ---", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error during registration.",
      },
      { status: 500 }
    );
  }
}