import db from "@/app/db";
import { calendarEvents, googleCalendar } from "@/app/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  fetchUpdatedEvents,
  getUserOauthAccessToken,
} from "@/app/actions/google-calendar";
import {
  scheduleReminder,
  cancelReminder,
} from "@/app/actions/schdule-reminder";

// Constants
const CALENDAR_ID = "primary";
const LOG_PREFIX = "[Google Calendar]";

// Custom error classes
class GoogleCalendarError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "GoogleCalendarError";
  }
}

class UserNotFoundError extends GoogleCalendarError {
  constructor(message: string = "User not found") {
    super(message, "USER_NOT_FOUND");
    this.name = "UserNotFoundError";
  }
}

// Type definitions
export interface GoogleCalendarUser {
  id: number;
  clerkId: string;
  name?: string;
  email: string;
}

export interface GoogleCalendarRecord {
  id: number;
  userId: number | null;
  channelId: string;
  resourceId: string;
  resourceUri: string;
  expiration: Date;
  syncToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: GoogleCalendarUser | null;
}

export interface EventType {
  kind: string;
  etag: string;
  id: string;
  status: string;
  htmlLink: string;
  created: Date | null;
  updated: Date | null;
  summary: string;
  creator: { email: string };
  organizer: { email: string };
  start: Date | null;
  end: Date | null;
  recurrence?: string[];
  transparency?: string;
  visibility?: string;
  iCalUID: string;
  sequence: number;
  reminders: any;
  birthdayProperties?: any;
  eventType?: string;
  attendees?: { email: string; responseStatus: string; organizer?: boolean }[];
  hangoutLink?: string;
  conferenceData?: {
    entryPoints: {
      uri: string;
      label: string;
      entryPointType: string;
      pin?: string;
      regionCode?: string;
    }[];
    conferenceId: string;
    conferenceSolution: {
      key: { type: string };
      name: string;
      iconUri: string;
    };
  };
  resourceId: string;
}

// Utility functions
function safeDateParser(value: any): Date | null {
  if (!value) {
    return null;
  }
  try {
    return new Date(value);
  } catch (error) {
    console.warn(
      `${LOG_PREFIX} Invalid date value encountered: ${value}. Returning null.`,
      error
    );
    return null;
  }
}

function logInfo(message: string, ...args: any[]) {
  console.log(`${LOG_PREFIX} ${message}`, ...args);
}

function logError(message: string, error: any) {
  console.error(`${LOG_PREFIX} ${message}:`, error);
}

// Main functions
export async function getUserFromChannelId(
  channelId: string
): Promise<GoogleCalendarRecord | null> {
  logInfo(`Getting user from channel ID: ${channelId}`);
  const user = (await db.query.googleCalendar.findFirst({
    where: eq(googleCalendar.channelId, channelId),
    with: {
      user: true,
    },
  })) as GoogleCalendarRecord | undefined;

  return user || null;
}

export async function channelToStoreCalendarEvent(
  channel_id: string,
  resourceId: string
) {
  const record = await getUserFromChannelId(channel_id);

  if (!record?.user) {
    throw new UserNotFoundError("No authenticated user found");
  }

  const clerkId = record.user.clerkId;
  if (!clerkId) {
    throw new UserNotFoundError("No authenticated user found");
  }
  logInfo(`Found user: ${clerkId}`);

  const tokens = await getUserOauthAccessToken(channel_id, clerkId);
  logInfo(`Found tokens: ${tokens}`);

  const events = await fetchUpdatedEvents({
    accessToken: tokens.data[0].token,
    calendarId: CALENDAR_ID,
    syncToken: record.syncToken ?? undefined,
  });

  logInfo(`Found events: ${events}`);
  console.dir(events);

  const eventsToInsert = events.events.map((event: any) => ({
    kind: event.kind,
    etag: event.etag,
    id: event.id,
    status: event.status,
    htmlLink: event.htmlLink,
    created: safeDateParser(event.created),
    updated: safeDateParser(event.updated),
    summary: event.summary,
    creator: event.creator,
    organizer: event.organizer,
    start: safeDateParser(event.start?.dateTime || event.start?.date),
    end: safeDateParser(event.end?.dateTime || event.end?.date),
    recurrence: event.recurrence,
    transparency: event.transparency,
    visibility: event.visibility,
    iCalUID: event.iCalUID,
    sequence: event.sequence,
    reminders: event.reminders,
    birthdayProperties: event.birthdayProperties,
    eventType: event.eventType,
    attendees: event.attendees,
    hangoutLink: event.hangoutLink,
    conferenceData: event.conferenceData,
    resourceId: resourceId,
  }));

  if (eventsToInsert.length > 0) {
    logInfo(`Processing ${eventsToInsert.length} events`);

    for (const event of eventsToInsert) {
      try {
        if (event.status === "cancelled") {
          await handleCancelledEvent(event);
        } else if (event.status === "confirmed") {
          await handleConfirmedEvent(event);
        } else {
          logInfo(`Skipping event with status: ${event.status}`);
        }
      } catch (error) {
        logError(`Error processing event ${event.id}`, error);
      }
    }

    // Update sync token after processing all events
    await db
      .update(googleCalendar)
      .set({
        syncToken: events.nextSyncToken,
      })
      .where(eq(googleCalendar.channelId, channel_id));
  }
}

async function handleCancelledEvent(event: EventType) {
  logInfo(`Updating cancelled event: ${event.id}`);
  const insertedEvent = await db
    .update(calendarEvents)
    .set({ status: "cancelled" })
    .where(eq(calendarEvents.id, event.id))
    .returning({ qstashMessageId: calendarEvents.qstashMessageId });

  if (insertedEvent[0]?.qstashMessageId) {
    await cancelReminder(insertedEvent[0].qstashMessageId);
  }
}

async function handleConfirmedEvent(event: EventType) {
  logInfo(`Upserting confirmed event: ${event.id}`);

  const result = await db
    .insert(calendarEvents)
    .values(event)
    .onConflictDoUpdate({
      target: calendarEvents.id,
      set: event,
    })
    .returning({
      wasInsert: sql<boolean>`CASE WHEN xmax = 0 THEN true ELSE false END`,
    });

  const wasInsert = result[0]?.wasInsert;

  if (!wasInsert) {
    await handleExistingEventUpdate(event);
  }

  // Schedule reminder - keyword checking is now handled in scheduleReminder
  const reminderResponse = await scheduleReminder(event, event.resourceId);

  // Update the event with the new message ID
  if (reminderResponse?.messageId) {
    await db
      .update(calendarEvents)
      .set({ qstashMessageId: reminderResponse.messageId })
      .where(eq(calendarEvents.id, event.id));
  }
}

async function handleExistingEventUpdate(event: EventType) {
  const existingEvent = await db.query.calendarEvents.findFirst({
    where: eq(calendarEvents.id, event.id),
  });

  if (existingEvent?.qstashMessageId) {
    logInfo(`Cancelling previous reminder for event: ${event.id}`);
    await cancelReminder(existingEvent.qstashMessageId);
  }
}
