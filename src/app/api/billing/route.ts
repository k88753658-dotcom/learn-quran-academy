import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// FETCH BILLING DATA
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    let studentId = searchParams.get("studentId");

    if (!studentId) {
      const selfStudent = await prisma.student.findFirst({
        where: { OR: [{ id: userId }, { profileId: userId }] },
        select: { id: true },
      });
      if (selfStudent) {
        studentId = selfStudent.id;
      }
    }

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID required" },
        { status: 400 }
      );
    }

    const billing = await prisma.billing.findUnique({
      where: { studentId },
    });

    if (!billing) {
      return NextResponse.json({
        success: true,
        billing: {
          amountDue: "3000 PKR",
          dueDate: "10th of this month",
          status: "Pending",
          lastPaymentDate: "N/A",
        },
      });
    }

    return NextResponse.json({
      success: true,
      billing: {
        id: billing.id,
        studentId: billing.studentId,
        amountDue: billing.amountDue || "3000 PKR",
        dueDate: "10th of this month",
        status: billing.status,
        lastPaymentDate:
          billing.status === "Paid" && billing.lastPaymentDate
            ? billing.lastPaymentDate.toISOString().split("T")[0]
            : "N/A",
      },
    });
  } catch (error: any) {
    console.error("Billing GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch billing" },
      { status: 500 }
    );
  }
}

// UPDATE BILLING STATUS (ADMIN TRIGGER)
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

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { studentId, status } = body;

    if (!studentId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing data strings" },
        { status: 400 }
      );
    }

    await prisma.billing.update({
      where: { studentId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: "Invoice state updated successfully!",
    });
  } catch (error: any) {
    console.error("Billing POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update billing" },
      { status: 500 }
    );
  }
}