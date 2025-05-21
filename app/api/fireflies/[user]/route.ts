// my-minimal-app/app/api/fireflies/[user]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { importFirefliesTranscript } from "@/lib/fireflies";
import { processMeetingToTasks } from "@/app/actions/automations/meeting-ai";

interface FirefliesWebhookEvent {
  meetingId: string;
  eventType: string;
}


export async function POST(request: NextRequest) {
  try {
    // Get user ID from the URL path
    const url = new URL(request.url);
    const userId = parseInt(url.pathname.split("/").pop() || "");

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body: FirefliesWebhookEvent = await request.json();
    if (!body.meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    const meeting = await importFirefliesTranscript(body.meetingId, userId);
    await processMeetingToTasks(meeting.id);

    return NextResponse.json({
      success: true,
      data: {
        meetingId: meeting.id,
        message: "Meeting processed successfully",
      },
    });
  } catch (error) {
    console.error("Error processing meeting:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
