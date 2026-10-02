import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const currentProfile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!currentProfile || currentProfile.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin privileges required." }, 
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, error: "Email required" }, { status: 400 });
    }

    const updated = await prisma.profile.update({
      where: { email },
      data: { role: "admin" },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    console.error("Make admin error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const currentProfile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!currentProfile || currentProfile.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin privileges required." }, 
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const email = body.email;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email required" }, { status: 400 });
    }

    const updated = await prisma.profile.update({
      where: { email },
      data: { role: "admin" },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    console.error("Make admin error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
