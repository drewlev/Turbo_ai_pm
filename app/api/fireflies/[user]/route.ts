import { NextRequest, NextResponse } from "next/server";
import { importFirefliesTranscript } from "@/lib/fireflies";

interface MeetingEvent {
  meetingId: string;
  eventType: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { user: string } }
) {
  try {
    const { user } = await params;
    const userId = parseInt(user);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body: MeetingEvent = await request.json();
    if (!body.meetingId) {
      return NextResponse.json(
        { error: "Missing meetingId" },
        { status: 400 }
      );
    }

    const meetingId = body.meetingId;

    const meeting = await importFirefliesTranscript(meetingId, userId);

    return NextResponse.json({
      success: true,
      data: {
        meetingId: meeting.id,
        message: "Transcript imported successfully",
      },
    });
  } catch (error) {
    console.error("Error importing transcript:", error);
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
