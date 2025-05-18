import db from "@/app/db";
import { calendarEvents, googleCalendar } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import {
  fetchUpdatedEvents,
  getUserOauthAccessToken,
} from "@/app/actions/google-calendar";
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
          await db
            .update(calendarEvents)
            .set({ status: "cancelled" })
            .where(eq(calendarEvents.id, event.id));
        } else if (event.status === "confirmed") {
          console.log(`[watchCalendar] Upserting confirmed event: ${event.id}`);
          await db.insert(calendarEvents).values(event).onConflictDoUpdate({
            target: calendarEvents.id,
            set: event,
          });
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
