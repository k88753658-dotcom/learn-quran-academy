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

    // 2. Fetch billing metrics and reviewing queue
    const [
      totalPaidCount,
      pendingCount,
      reviewingTicketsCount,
      overdueCount,
      recentTickets,
      recentInvoices,
    ] = await Promise.all([
      prisma.billing.count({ where: { status: "Paid" } }),
      prisma.billing.count({ where: { status: "Pending" } }),
      prisma.paymentTicket.count({ where: { status: "Reviewing" } }),
      prisma.billing.count({ where: { status: "Overdue" } }),
      prisma.paymentTicket.findMany({
        take: 20,
        orderBy: { submittedAt: "desc" },
        include: {
          student: {
            select: {
              id: true,
              studentName: true,
              course: true,
            },
          },
        },
      }),
      prisma.billing.findMany({
        take: 20,
        orderBy: { updatedAt: "desc" },
        include: {
          student: {
            select: {
              id: true,
              studentName: true,
              course: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      billing: {
        summary: {
          totalPaid: totalPaidCount,
          pendingCount,
          reviewingTickets: reviewingTicketsCount,
          overdueCount,
        },
        recentTickets: recentTickets.map((t) => ({
          id: t.id,
          _id: t.id,
          studentId: t.studentId,
          studentName: t.student?.studentName || "Student",
          course: t.student?.course || "N/A",
          transactionId: t.transactionId,
          methodUsed: t.methodUsed,
          status: t.status,
          submittedAt: t.submittedAt,
          resolvedAt: t.resolvedAt,
        })),
        recentInvoices: recentInvoices.map((inv) => ({
          id: inv.id,
          _id: inv.id,
          studentId: inv.studentId,
          studentName: inv.student?.studentName || "Student",
          amountDue: inv.amountDue,
          status: inv.status,
          lastPaymentDate: inv.lastPaymentDate
            ? inv.lastPaymentDate.toISOString().split("T")[0]
            : "N/A",
          updatedAt: inv.updatedAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("API Error in admin-billing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve billing dashboard data" },
      { status: 500 }
    );
  }
}
