import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
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

    // 2. Validate request payload
    const body = await req.json().catch(() => ({}));
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Missing required studentId parameter." },
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

    // 4. Update student notification message
    await prisma.student.update({
      where: { id: String(studentId) },
      data: {
        lastAssignment:
          "Your recent payment submission could not be verified. Please submit a valid transaction ID or contact your instructor.",
      },
    });

    // 5. Reset billing status to Pending
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

    // 6. Mark reviewing payment tickets as Rejected
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
      message: "Manual payment rejected and invoice reset to Pending.",
    });
  } catch (error: any) {
    console.error("API Error in reject-manual-payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process manual payment rejection" },
      { status: 500 }
    );
  }
}
