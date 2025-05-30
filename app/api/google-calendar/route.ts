// app/api/google-calendar/route.js
import { NextResponse } from "next/server";
import {
  getUserFromChannelId,
  channelToStoreCalendarEvent,
} from "@/lib/google-calendar";

export async function POST(request: Request) {
  try {
    console.log("[webhook] Received Google Calendar notification");

    const headers = Object.fromEntries(request.headers);
    const channelId = headers["x-goog-channel-id"];
    const resourceId = headers["x-goog-resource-id"];

    console.log(`[webhook] Channel ID: ${channelId}`);
    console.log(`[webhook] Resource ID: ${resourceId}`);

    if (!channelId || !resourceId) {
      return NextResponse.json({ error: "Missing headers" }, { status: 400 });
    }

    console.log(`[webhook] Getting user from channel ID: ${channelId}`);
    const record = await getUserFromChannelId(channelId);

    if (!record) {
      console.log(`[webhook] User not found`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`[webhook] User found: ${record}`);

    await channelToStoreCalendarEvent(channelId, resourceId);

    return NextResponse.json({ message: "Processed successfully" });
  } catch (error: any) {
    console.error("[webhook] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
