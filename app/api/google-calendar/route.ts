// app/api/google-calendar/route.js
import { NextResponse } from "next/server";
import { fetchUpdatedEvents } from "@/app/actions/google-calendar";
import { clerkClient, User } from "@clerk/nextjs/server";

export async function POST(request: NextResponse) {
  try {
    console.log("[webhook] Received Google Calendar notification");

    // Get all headers
    const headers = Object.fromEntries(request.headers);
    console.log("[webhook] Headers:", headers);

    // Extract Google Calendar specific headers
    const channelId = headers["x-goog-channel-id"];
    const resourceId = headers["x-goog-resource-id"];
    const resourceState = headers["x-goog-resource-state"];
    const messageNumber = headers["x-goog-message-number"];
    const channelExpiration = headers["x-goog-channel-expiration"];
    const resourceUri = headers["x-goog-resource-uri"];

    console.log("[webhook] Google Calendar notification details:", {
      channelId,
      resourceId,
      resourceState,
      messageNumber,
      channelExpiration,
      resourceUri,
    });

    if (!channelId || !resourceId) {
      console.error("[webhook] Missing required headers");
      return NextResponse.json(
        { error: "Missing required headers" },
        { status: 400 }
      );
    }

    // Get the user associated with this channel
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList();

    // Find the user who has this channel ID in their metadata
    const user = users.find(
      (u: User) => u.publicMetadata?.calendarChannelId === channelId
    );

    if (!user) {
      console.error("[webhook] No user found for channel ID:", channelId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the user's Google OAuth token
    const tokens = await client.users.getUserOauthAccessToken(
      user.id,
      "oauth_google"
    );

    if (!tokens.data || tokens.data.length === 0) {
      console.error("[webhook] No Google OAuth tokens found for user");
      return NextResponse.json(
        { error: "No OAuth tokens found" },
        { status: 401 }
      );
    }

    // Find the token with calendar scope
    const calendarToken =
      tokens.data.find(
        (token) =>
          token.scopes?.includes("https://www.googleapis.com/auth/calendar") ||
          token.scopes?.includes(
            "https://www.googleapis.com/auth/calendar.readonly"
          )
      ) || tokens.data[0];

    if (!calendarToken?.token) {
      console.error("[webhook] No valid calendar token found");
      return NextResponse.json(
        { error: "No valid calendar token" },
        { status: 401 }
      );
    }

    // Get the current sync token from user metadata
    const syncToken = user.publicMetadata?.calendarSyncToken as
      | string
      | undefined;

    // Fetch the updated events
    const { events, nextSyncToken } = await fetchUpdatedEvents({
      accessToken: calendarToken.token,
      calendarId: "primary",
      syncToken,
    });

    console.log(`[webhook] Fetched ${events.length} updated events`);

    // Process each event
    for (const event of events) {
      console.log("[webhook] Processing event:", {
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        attendees: event.attendees,
      });

      // Here you can implement your workflow logic:
      // 1. Check if it's a new event
      // 2. Extract client emails from attendees
      // 3. Schedule reminders or notifications
      // 4. Store the event details in your database
    }

    // Update the user's sync token in metadata
    await client.users.updateUser(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        calendarSyncToken: nextSyncToken,
      },
    });

    console.log("[webhook] Successfully processed notification");
    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error: any) {
    console.error("[webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: `Failed to process webhook: ${error.message}` },
      { status: 400 }
    );
  }
}
