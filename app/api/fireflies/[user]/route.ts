import { NextRequest, NextResponse } from "next/server";
import { importFirefliesTranscript } from "@/lib/fireflies";
import { processMeetingToTasks } from "@/app/actions/automations/meeting-ai";

interface FirefliesWebhookEvent {
  meetingId: string;
  eventType: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { user: string } }
) {
  try {
    const userId = parseInt(params.user);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body: FirefliesWebhookEvent = await request.json();
    if (!body.meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    // Step 1: Import the transcript
    const meeting = await importFirefliesTranscript(body.meetingId, userId);

    // Step 2: Process the meeting into tasks
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
