import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { studentId } = await req.json();
    
    // Dynamically point straight into our manual verification page pipeline 
    const manualTerminalUrl = `/payment-terminal?studentId=${studentId}`;
    
    return NextResponse.json({ success: true, url: manualTerminalUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}