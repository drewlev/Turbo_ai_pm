// my-minimal-app/app/api/fireflies/[user]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { importFirefliesTranscript } from "@/lib/fireflies";
import { processMeetingToTasks } from "@/app/actions/automations/meeting-ai";

interface FirefliesWebhookEvent {
  meetingId: string;
  eventType: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    meetingId: number;
    message: string;
  };
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get user ID from the URL path
    const url = new URL(request.url);
    const userId = parseInt(url.pathname.split("/").pop() || "");

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body: FirefliesWebhookEvent = await request.json();
    if (!body.meetingId) {
      return NextResponse.json(
        { success: false, error: "Missing meetingId" },
        { status: 400 }
      );
    }

    const meeting = await importFirefliesTranscript(body.meetingId, userId);
    const result = await processMeetingToTasks(meeting.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

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
