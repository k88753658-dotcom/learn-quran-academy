import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const courseCount = await prisma.course.count();
    return NextResponse.json({
      success: true,
      message: "Database connection healthy",
      courseCount,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
