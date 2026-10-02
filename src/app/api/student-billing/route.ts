import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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
    let studentId = searchParams.get("studentId") || searchParams.get("id");

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
    console.error("Student Billing GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student billing" },
      { status: 500 }
    );
  }
}
