import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "../../../lib/rate-limit";

export async function POST(req: Request) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limitCheck = checkRateLimit(clientIp, { limit: 20, windowMs: 60000 });

    if (limitCheck.isRateLimited) {
      return rateLimitResponse(limitCheck.limit, limitCheck.resetSeconds);
    }

    const body = await req.json();
    const { message, rating, event } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Valid non-empty message is required" },
        { status: 400 },
      );
    }

    const sanitizedMessage = message.trim().slice(0, 1000);
    const sanitizedRating = typeof rating === "number" && rating >= 1 && rating <= 5 ? rating : 5;

    console.log(
      `[FEEDBACK_LOGGED]: Rating: ${sanitizedRating}/5, Message: "${sanitizedMessage}", Event: ${event || "feedback_submitted"}`,
    );

    return NextResponse.json(
      {
        success: true,
        loggedEvent: {
          event: event || "feedback_submitted",
          rating: sanitizedRating,
          message: sanitizedMessage,
          timestamp: new Date().toISOString(),
        },
      },
      {
        headers: {
          "X-RateLimit-Limit": limitCheck.limit.toString(),
          "X-RateLimit-Remaining": limitCheck.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

