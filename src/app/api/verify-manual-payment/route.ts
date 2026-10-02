import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { studentId, transactionId, methodUsed } = body;

    // 1. Validate required submission fields
    if (!studentId || !transactionId || !methodUsed) {
      return NextResponse.json(
        { success: false, error: "Missing proof of payment details." },
        { status: 400 }
      );
    }

    const cleanTxId = String(transactionId).trim().toUpperCase();

    // 2. Duplicate transaction ID guard
    const existing = await prisma.paymentTicket.findUnique({
      where: { transactionId: cleanTxId },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "This Transaction ID has already been submitted." },
        { status: 400 }
      );
    }

    // 3. Record PaymentTicket with status Reviewing
    const ticket = await prisma.paymentTicket.create({
      data: {
        studentId,
        transactionId: cleanTxId,
        methodUsed: String(methodUsed).trim(),
        status: "Reviewing",
      },
    });

    // 4. Transition associated student Billing record to Reviewing
    await prisma.billing.upsert({
      where: { studentId },
      update: { status: "Reviewing" },
      create: {
        studentId,
        amountDue: "3000 PKR",
        status: "Reviewing",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Receipt logged successfully!",
      ticket: {
        id: ticket.id,
        studentId: ticket.studentId,
        transactionId: ticket.transactionId,
        status: ticket.status,
      },
    });
  } catch (error: any) {
    console.error("Verify Manual Payment Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal payment processing error" },
      { status: 500 }
    );
  }
}