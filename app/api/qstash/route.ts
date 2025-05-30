import { NextRequest, NextResponse } from "next/server";
import { handleCalendarEventNotification } from "@/app/actions/automations/automessage";

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();

    if (!requestBody.eventId) {
      return NextResponse.json(
        { error: "Missing required field: eventId" },
        { status: 400 }
      );
    }

    await handleCalendarEventNotification(requestBody.eventId);

    return NextResponse.json({
      success: true,
      message: "Calendar event notification processed successfully",
      eventId: requestBody.eventId,
    });
  } catch (error) {
    console.error("[QStash Webhook] Error processing request:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process calendar event notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
