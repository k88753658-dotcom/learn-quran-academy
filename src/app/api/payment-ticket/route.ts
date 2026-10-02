import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Payment Ticket Submission API Route
 * Handlers:
 *   - POST: create payment verification ticket
 *     prisma.paymentTicket.create({ data: { studentId, studentName, amount, transactionId, receiptUrl, status: 'Pending' } })
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentId,
      studentName,
      amount,
      transactionId,
      receiptUrl,
      methodUsed,
      status,
    } = body;

    // Validate required fields
    if (!studentId || !transactionId) {
      return NextResponse.json(
        { success: false, error: "studentId and transactionId are required" },
        { status: 400 }
      );
    }

    const cleanTxId = transactionId.trim().toUpperCase();

    // Check for duplicate transaction ID
    const existing = await prisma.paymentTicket.findUnique({
      where: { transactionId: cleanTxId },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "This Transaction ID has already been submitted." },
        { status: 400 }
      );
    }

    // Enforce ticket status Reviewing unconditionally on client submission
    const ticketStatus = "Reviewing";

    // Create the payment ticket in Prisma
    const ticket = await prisma.paymentTicket.create({
      data: {
        studentId,
        transactionId: cleanTxId,
        methodUsed: methodUsed || (receiptUrl ? "Receipt Upload" : "Manual Transfer"),
        status: ticketStatus,
      },
    });

    // Synchronize student's billing state to Reviewing
    try {
      await prisma.billing.upsert({
        where: { studentId },
        update: { status: "Reviewing" },
        create: {
          studentId,
          amountDue: amount ? String(amount) : "3000 PKR",
          status: "Reviewing",
        },
      });
    } catch (billingErr) {
      console.warn("Billing status update warning:", billingErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment ticket submitted successfully",
        ticket,
        id: ticket.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Payment Ticket Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process payment ticket" },
      { status: 500 }
    );
  }
}
