import { NextResponse } from "next/server";
import dns from "dns";

// Force Google DNS to bypass local ISP blocks
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    if (!process.env.AI_API_KEY) {
      return NextResponse.json({ success: false, error: "API Key missing" });
    }

    // UPDATED URL: Changed models/gemini-1.5-flash to v1 (more stable)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.AI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are a helpful Quran and Islamic Studies tutor. Answer this: ${message}` }] }]
      })
    });

    const data = await response.json();
    
    // Check if the API returned an error message
    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message });
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ success: true, answer: aiResponse });

  } catch (error: any) {
    console.error("AI Error:", error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}