"use server";
import { v4 as uuidv4 } from "uuid";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";

interface WatchCalendarResponse {
  kind: string;
  id: string;
  resourceId: string;
  resourceUri: string;
  channelId: string;
  expiration: string;
}

interface WatchCalendarError {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

export async function watchCalendar(): Promise<WatchCalendarResponse> {
  console.log("[watchCalendar] Starting calendar watch setup");

  // Get the current authenticated user from Clerk
  const user = await currentUser();
  console.log(`[watchCalendar] Found user: ${user?.id}`);

  if (!user) {
    console.error("[watchCalendar] No authenticated user found");
    throw new Error("No authenticated user found");
  }

  // Get the OAuth access token using the recommended Clerk method
  const client = await clerkClient();
  console.log("[watchCalendar] Fetching OAuth tokens");

  const tokens = await client.users.getUserOauthAccessToken(
    user.id,
    "oauth_google"
  );

  if (!tokens.data || tokens.data.length === 0) {
    console.error("[watchCalendar] No Google OAuth tokens found");
    throw new Error("No Google OAuth tokens found for user");
  }

  console.log(`[watchCalendar] Found ${tokens.data.length} OAuth tokens`);

  // Find the token with calendar scope or use the first available token
  const calendarToken =
    tokens.data.find(
      (token) =>
        token.scopes?.includes("https://www.googleapis.com/auth/calendar") ||
        token.scopes?.includes(
          "https://www.googleapis.com/auth/calendar.readonly"
        )
    ) || tokens.data[0];

  const accessToken = calendarToken.token;

  if (!accessToken) {
    console.error("[watchCalendar] Failed to get valid access token");
    throw new Error("Failed to get Google Calendar access token");
  }

  console.log("[watchCalendar] Getting initial sync token");
  // Get initial sync token
  const initialSyncToken = await getInitialSyncToken(accessToken);
  console.log(`[watchCalendar] Got initial sync token: ${initialSyncToken}`);

  const webhookUrl = process.env.NEXTAUTH_URL + "/api/google-calendar";
  const channelId = uuidv4();
  console.log(`[watchCalendar] Generated channel ID: ${channelId}`);
  console.log(`[watchCalendar] Webhook URL: ${webhookUrl}`);

  console.log("[watchCalendar] Setting up calendar watch");
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events/watch",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: channelId,
        type: "web_hook",
        address: webhookUrl,
        params: {
          ttl: "604800", // 7 days in seconds
        },
      }),
    }
  );

  if (!response.ok) {
    const error: WatchCalendarError = await response.json();
    console.error(`[watchCalendar] Failed to watch calendar:`, error);
    throw new Error(`Failed to watch calendar: ${error.error.message}`);
  }

  const watchResponse = await response.json();
  console.log(
    "[watchCalendar] Successfully set up calendar watch:",
    watchResponse
  );

  // Store both the channel ID and sync token in user metadata
  console.log(
    "[watchCalendar] Updating user metadata with channel ID and sync token"
  );
  await client.users.updateUser(user.id, {
    publicMetadata: {
      calendarChannelId: channelId,
      calendarSyncToken: initialSyncToken,
    },
  });
  console.log("[watchCalendar] Successfully updated user metadata");

  return watchResponse;
}

export async function stopWatchingCalendar(
  channelId: string,
  resourceId: string
): Promise<void> {
  console.log(
    `[stopWatchingCalendar] Starting for channel: ${channelId}, resource: ${resourceId}`
  );

  if (!channelId || !resourceId) {
    console.error("[stopWatchingCalendar] Missing required parameters");
    throw new Error(
      "Channel ID and Resource ID are required to stop watching calendar"
    );
  }

  // Get the current authenticated user
  const user = await currentUser();
  console.log(`[stopWatchingCalendar] Found user: ${user?.id}`);

  if (!user) {
    console.error("[stopWatchingCalendar] No authenticated user found");
    throw new Error("No authenticated user found");
  }

  // Get the OAuth access token using Clerk client
  const client = await clerkClient();
  console.log("[stopWatchingCalendar] Fetching OAuth tokens");

  const tokens = await client.users.getUserOauthAccessToken(
    user.id,
    "oauth_google"
  );

  if (!tokens.data || tokens.data.length === 0) {
    console.error("[stopWatchingCalendar] No Google OAuth tokens found");
    throw new Error("No Google OAuth tokens found for user");
  }

  console.log(
    `[stopWatchingCalendar] Found ${tokens.data.length} OAuth tokens`
  );

  // Find the token with calendar scope or use the first available token
  const calendarToken =
    tokens.data.find(
      (token) =>
        token.scopes?.includes("https://www.googleapis.com/auth/calendar") ||
        token.scopes?.includes(
          "https://www.googleapis.com/auth/calendar.readonly"
        )
    ) || tokens.data[0];

  const accessToken = calendarToken.token;

  if (!accessToken) {
    console.error("[stopWatchingCalendar] Failed to get valid access token");
    throw new Error("Failed to get Google Calendar access token");
  }

  console.log(
    "[stopWatchingCalendar] Sending stop request to Google Calendar API"
  );
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/channels/stop",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: channelId,
        resourceId: resourceId,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error(
      `[stopWatchingCalendar] Failed with status ${response.status}:`,
      error
    );
    throw new Error(
      `Failed to stop watching calendar: ${
        error.error?.message || "Unknown error"
      }`
    );
  }

  // Clear the user's calendar metadata
  await client.users.updateUser(user.id, {
    publicMetadata: {
      ...user.publicMetadata,
      calendarChannelId: null,
      calendarResourceId: null,
      calendarSyncToken: null,
    },
  });

  console.log("[stopWatchingCalendar] Successfully stopped watching calendar");
}

export async function getInitialSyncToken(
  accessToken: string,
  calendarId: string = "primary"
) {
  console.log(`[getInitialSyncToken] Starting for calendar: ${calendarId}`);

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}/events?maxResults=1`;

  console.log(`[getInitialSyncToken] Fetching from URL: ${url}`);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(
      `[getInitialSyncToken] Failed with status ${response.status}:`,
      error
    );
    throw new Error(
      `Failed to get initial sync token: ${error.error?.message}`
    );
  }

  const data = await response.json();
  console.log(
    `[getInitialSyncToken] Successfully obtained sync token: ${data.nextSyncToken}`
  );
  return data.nextSyncToken;
}

export async function fetchUpdatedEvents({
  accessToken,
  calendarId = "primary",
  syncToken,
}: {
  accessToken: string;
  calendarId?: string;
  syncToken?: string;
}) {
  console.log(
    `[fetchUpdatedEvents] Starting fetch for calendar: ${calendarId}`
  );
  console.log(
    `[fetchUpdatedEvents] Using syncToken: ${
      syncToken || "none (initial sync)"
    }`
  );

  let url: string;

  if (syncToken) {
    // Use syncToken for incremental sync
    url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events?syncToken=${syncToken}`;
    console.log(`[fetchUpdatedEvents] Performing incremental sync with token`);
  } else {
    // Initial sync - get events from the last 5 minutes
    const timeMin = new Date(Date.now() - 1000 * 60 * 5).toISOString();
    url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events?timeMin=${timeMin}`;
    console.log(`[fetchUpdatedEvents] Performing initial sync from ${timeMin}`);
  }

  console.log(`[fetchUpdatedEvents] Fetching from URL: ${url}`);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(
      `[fetchUpdatedEvents] Failed with status ${response.status}:`,
      error
    );

    if (error.error?.status === "GONE") {
      console.log(
        `[fetchUpdatedEvents] Sync token expired, will need full sync`
      );
      throw new Error("Sync token expired. Do a full sync.");
    }
    throw new Error(`Failed to fetch updated events: ${error.error?.message}`);
  }

  const data = await response.json();
  console.log(
    `[fetchUpdatedEvents] Successfully fetched ${
      data.items?.length || 0
    } events`
  );
  console.log(`[fetchUpdatedEvents] Next sync token: ${data.nextSyncToken}`);

  return {
    events: data.items,
    nextSyncToken: data.nextSyncToken,
  };
}
