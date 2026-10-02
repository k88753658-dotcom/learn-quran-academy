import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json(
      { success: false, error: 'Missing Resend API key in environment.' },
      { status: 500 }
    );
  }

  const resend = new Resend(resendApiKey);
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Send the email to your academy inbox
    const data = await resend.emails.send({
      from: 'Academy Contact Form <onboarding@resend.dev>', // Keep this exact email for the free tier
      to: 'learnquranacaademy.me@gmail.com', // Where you will receive the message
      subject: `New Inquiry: ${subject || 'General Question'}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Email sending failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}