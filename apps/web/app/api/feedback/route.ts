import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, rating, event } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    console.log(
      `[FEEDBACK_LOGGED]: Rating: ${rating || 5}/5, Message: "${message}", Event: ${event || "feedback_submitted"}`,
    );

    await new Promise((resolve) => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      loggedEvent: {
        event: event || "feedback_submitted",
        rating: rating || 5,
        message,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
