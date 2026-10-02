import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      return NextResponse.json({ error: "Missing signature or secret configurations" }, { status: 400 });
    }
    // Verify that this signal actually came from the payment system and wasn't faked
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the automatic enrollment once payment succeeds
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Extract our custom tracking metadata
    const studentId = session.metadata?.studentId;
    const courseName = session.metadata?.courseName;

    if (studentId) {
      try {
        // AUTOMATIC ENROLLMENT HANDSHAKE
        await prisma.student.update({
          where: { id: studentId },
          data: {
            course: courseName,
            enrolled: true,
            progress: 0,
            lastAssignment: "Welcome to your first lesson! Your teacher will post tasks here shortly.",
          },
        });

        await prisma.billing.upsert({
          where: { studentId },
          update: {
            status: "Paid",
            amountDue: "0 PKR",
            lastPaymentDate: new Date(),
          },
          create: {
            studentId,
            status: "Paid",
            amountDue: "0 PKR",
            lastPaymentDate: new Date(),
          },
        });

        console.log(`Successfully enrolled student ${studentId} automatically via card transaction.`);
      } catch (dbError) {
        console.error("Database upgrade error during fulfillment webhook:", dbError);
      }
    }
  }

  return NextResponse.json({ received: true });
}