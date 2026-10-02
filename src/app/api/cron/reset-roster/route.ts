import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access: Invalid or missing CRON secret." }, 
        { status: 401 }
      );
    }

    const today = new Date();
    console.log(`[CRON] Automation script triggered on: ${today.toISOString()}`);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (tomorrow.getDate() === 1) {
      console.log("[CRON] End of month detected. Archiving logic delegated to Postgres.");
      tomorrow.setUTCHours(0, 0, 0, 0);
      await prisma.attendance.deleteMany({
        where: {
          date: {
            lt: tomorrow,
          },
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Daily reset and/or monthly archiving completed successfully." 
    });

  } catch (error: any) {
    console.error("[CRON] Script Failure:", error.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error during automation processing." }, 
      { status: 500 }
    );
  }
}