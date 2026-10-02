import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize admin caller
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required." },
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

    // 2. Validate request payload
    const body = await req.json().catch(() => ({}));
    const { studentId, action } = body;

    if (!studentId || !action || !["Approve", "Reject", "approve", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid fields. studentId and action ('Approve' or 'Reject') required." },
        { status: 400 }
      );
    }

    // 3. Find target student account
    const student = await prisma.student.findUnique({
      where: { id: String(studentId) },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Target student account record could not be found." },
        { status: 404 }
      );
    }

    const isApproval = String(action).toLowerCase() === "approve";

    // 4. Case A: Approve flow
    if (isApproval) {
      await prisma.student.update({
        where: { id: String(studentId) },
        data: {
          enrolled: true,
          lastAssignment:
            "Welcome to Learn Quran Academy! Your account has been verified and fully activated by the administrator.",
        },
      });

      await prisma.billing.upsert({
        where: { studentId: String(studentId) },
        update: {
          status: "Paid",
          amountDue: "0 PKR",
          lastPaymentDate: new Date(),
        },
        create: {
          studentId: String(studentId),
          status: "Paid",
          amountDue: "0 PKR",
          lastPaymentDate: new Date(),
        },
      });

      await prisma.paymentTicket.updateMany({
        where: {
          studentId: String(studentId),
          status: "Reviewing",
        },
        data: {
          status: "Approved",
          resolvedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Student account successfully activated!",
      });
    }

    // 5. Case B: Reject flow
    await prisma.student.update({
      where: { id: String(studentId) },
      data: {
        lastAssignment:
          "Your recent payment submission could not be verified. Please submit a valid transaction ID or contact your instructor.",
      },
    });

    await prisma.billing.upsert({
      where: { studentId: String(studentId) },
      update: {
        status: "Pending",
      },
      create: {
        studentId: String(studentId),
        status: "Pending",
        amountDue: "3000 PKR",
      },
    });

    await prisma.paymentTicket.updateMany({
      where: {
        studentId: String(studentId),
        status: "Reviewing",
      },
      data: {
        status: "Rejected",
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Manual payment verification rejected. Student invoice reset to Pending.",
    });
  } catch (error: any) {
    console.error("API Error in approve-manual-payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process manual payment decision" },
      { status: 500 }
    );
  }
}