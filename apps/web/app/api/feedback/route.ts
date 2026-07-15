import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // In a real app, you would save this to a database (e.g., Supabase, PostgreSQL)
    // or send it to a service like Slack, Discord, or Linear.
    console.log("[FEEDBACK RECEIVED]:", message);

    // Mock delay for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
