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

export interface EventType {
  kind: string;
  etag: string;
  id: string;
  status: string;
  htmlLink: string;
  created: string; // Or Date, depending on safeDateParser
  updated: string; // Or Date, depending on safeDateParser
  summary: string;
  creator: { email: string };
  organizer: { email: string };
  start: Date | null; // Or Date, depending on safeDateParser and null handling
  end: Date | null; // Or Date, depending on safeDateParser and null handling
  recurrence?: string[];
  transparency?: string;
  visibility?: string;
  iCalUID: string;
  sequence: number;
  reminders: any; // Define this type more precisely if possible
  birthdayProperties?: any; // Define this type
  eventType?: string;
  attendees?: { email: string; responseStatus: string; organizer?: boolean }[];
  hangoutLink?: string;
  conferenceData?: {
    entryPoints: {
      uri: string;
      label: string;
      entryPointType: string;
      pin?: string;
      regionCode?: string; // Only for phone type
    }[];
    conferenceId: string;
    conferenceSolution: {
      key: { type: string };
      name: string;
      iconUri: string;
    };
  };
}

export async function getUserFromChannelId(channelId: string) {
  const user = await db.query.googleCalendar.findFirst({
    where: eq(googleCalendar.channelId, channelId),
    with: {
      user: true,
    },
  });
  return user;
}

export async function channelToStoreCalendarEvent(channel_id: string) {
  const record = await db.query.googleCalendar.findFirst({
    where: eq(googleCalendar.channelId, channel_id),
    with: {
      user: true,
    },
  });

  if (!record?.user) {
    console.error("[watchCalendar] No authenticated user found");
    throw new Error("No authenticated user found");
  }

  const clerkId = record.user.clerkId;

  if (!clerkId) {
    console.error("[watchCalendar] No authenticated user found");
    throw new Error("No authenticated user found");
  }
  console.log(`[watchCalendar] Found user: ${clerkId}`);

  const tokens = await getUserOauthAccessToken(channel_id, clerkId);

  console.log(`[watchCalendar] Found tokens: ${tokens}`);

  const events = await fetchUpdatedEvents({
    accessToken: tokens.data[0].token,
    calendarId: "primary",
    syncToken: record.syncToken ?? undefined,
  });

  console.log(`[watchCalendar] Found events: ${events}`);

  console.dir(events);
  function safeDateParser(value: any): Date | null {
    if (!value) {
      return null;
    }
    try {
      return new Date(value);
    } catch (error) {
      console.warn(
        `[Date Warning] Invalid date value encountered: ${value}. Returning null.`,
        error
      );
      return null;
    }
  }

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
  }));

  if (eventsToInsert.length > 0) {
    console.log(`[watchCalendar] Processing ${eventsToInsert.length} events`);

    for (const event of eventsToInsert) {
      try {
        if (event.status === "cancelled") {
          console.log(`[watchCalendar] Updating cancelled event: ${event.id}`);
          const insertedEvent = await db
            .update(calendarEvents)
            .set({ status: "cancelled" })
            .where(eq(calendarEvents.id, event.id));
        } else if (event.status === "confirmed") {
          console.log(`[watchCalendar] Upserting confirmed event: ${event.id}`);

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
            // This was an update, so we need to cancel the previous reminder
            const existingEvent = await db.query.calendarEvents.findFirst({
              where: eq(calendarEvents.id, event.id),
            });

            if (existingEvent?.qstashMessageId) {
              console.log(
                `[watchCalendar] Cancelling previous reminder for event: ${event.id}`
              );
              await cancelReminder(existingEvent.qstashMessageId);
            }
          }

          const reminderResponse = await scheduleReminder(event as EventType);

          // Update the event with the new message ID
          if (reminderResponse?.messageId) {
            await db
              .update(calendarEvents)
              .set({ qstashMessageId: reminderResponse.messageId })
              .where(eq(calendarEvents.id, event.id));
          }
        } else {
          console.log(
            `[watchCalendar] Skipping event with status: ${event.status}`
          );
        }
      } catch (error) {
        console.error(
          `[watchCalendar] Error processing event ${event.id}:`,
          error
        );
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
