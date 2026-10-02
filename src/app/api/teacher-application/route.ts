import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name: rawName,
      fullName,
      email: rawEmail,
      whatsapp: rawWhatsapp,
      phone,
      country,
      qualification: rawQualification,
      specializations,
      experienceYears,
      bio,
      resumeUrl,
    } = body;

    const name = (rawName || fullName || "").trim();
    const email = (rawEmail || "").trim();
    const whatsapp = (rawWhatsapp || phone || "").trim();
    const qualification = (rawQualification || "").trim();

    // Validation for core applicant contact and qualification fields
    if (!name || !email || !whatsapp || !qualification) {
      return NextResponse.json(
        { success: false, error: "Please fill all required fields (name, email, whatsapp, qualification)." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format." },
        { status: 400 }
      );
    }

    const safeEmail = email.toLowerCase();

    // Check for duplicate application
    const existing = await prisma.teacherApplication.findUnique({
      where: { email: safeEmail },
    });

    if (existing) {
      const statusMsg =
        existing.status === "pending"
          ? "Your application is already under review."
          : existing.status === "approved"
          ? "You have already been approved! Check your email for login credentials."
          : "Your previous application was not accepted. Please contact us for more information.";
      return NextResponse.json({ success: false, error: statusMsg }, { status: 409 });
    }

    // Insert application into database via Prisma
    const application = await prisma.teacherApplication.create({
      data: {
        name,
        email: safeEmail,
        whatsapp,
        country: country?.trim() || null,
        qualification,
        specializations: Array.isArray(specializations)
          ? specializations
          : specializations
          ? [specializations]
          : [],
        experienceYears: parseInt(experienceYears, 10) || 0,
        bio: bio?.trim() || null,
        status: "pending",
      },
    });

    // Notify admin via email if Resend is configured
    if (resend) {
      try {
        await resend.emails.send({
          from: "Academy HR <onboarding@resend.dev>",
          to: "learnquranacaademy.me@gmail.com",
          subject: `📋 New Teacher Application: ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #0F5132; margin-bottom: 4px;">New Teacher Application</h2>
              <p style="color: #6b7280; font-size: 14px;">A new instructor has applied to join the academy.</p>
              <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>WhatsApp:</strong> <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}">${whatsapp}</a></p>
              <p><strong>Country:</strong> ${country || "Not specified"}</p>
              <p><strong>Qualification:</strong> ${qualification}</p>
              <p><strong>Specializations:</strong> ${Array.isArray(specializations) ? specializations.join(", ") : specializations || "None"}</p>
              <p><strong>Experience:</strong> ${experienceYears || 0} years</p>
              <p><strong>Bio:</strong> ${bio || "Not provided"}</p>
              <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
              <p style="color: #6b7280; font-size: 12px;">Review this application in your Admin Dashboard → Applications tab.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send admin notification email:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      id: application.id,
    });
  } catch (error: any) {
    console.error("Teacher Application Error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
