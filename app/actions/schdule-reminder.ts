"use server";

import { getUnixTime } from "date-fns";
import { Client } from "@upstash/qstash";
import { EventType } from "@/lib/google-calendar";
import { getTrackingKeywords } from "./settings/calendar-event-tracking";

// Initialize the Upstash Qstash client
const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
});

const qstashUrl = process.env.NEXTAUTH_URL + "/api/qstash";

interface ReminderPayload {
  eventId: string;
  reminderTime: string;
}

export async function publishQStashMessage(
  notBefore: number,
  payload: ReminderPayload
) {
  try {
    const response = await qstash.publishJSON({
      url: qstashUrl,
      body: payload,
      notBefore,
    });
    console.log("[QStash] Message published successfully:", response);
    return response;
  } catch (error) {
    console.error("[QStash] Failed to publish message:", error);
    throw error;
  }
}

export async function publishQStashCron<T>(
  cron: string,
  payload: T,
  endpoint: string
) {
  try {
    const response = await qstash.schedules.create({
      cron,
      body: JSON.stringify(payload),
      destination: qstashUrl + endpoint,
    });
    console.log("[QStash] Message published successfully:", response);
    return response;
  } catch (error) {
    console.error("[QStash] Failed to publish message:", error);
    throw error;
  }
}

export async function cancelReminder(messageId: string) {
  try {
    const response = await fetch(
      `https://qstash.upstash.io/v2/messages/${messageId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
        },
      }
    );
    console.log("[QStash] Message deleted successfully:", response);
    return response;
  } catch (error) {
    console.error("[QStash] Failed to delete message:", error);
    throw error;
  }
}

// This schdulels a reminder specofic events like  a design review or kick off event
export async function scheduleReminder(event: EventType) {
  //This is a temporary solution to get the keywords from the database
  //It isnt user specific yet
  const keywords = await getTrackingKeywords();
  const isRelevantEvent = keywords.some((keyword) =>
    event.summary.toLowerCase().includes(keyword)
  );

  if (!isRelevantEvent) {
    console.log(
      "[Reminder] Event is not a design review or kick off:",
      event.summary
    );
    return;
  }

  if (!event.start) {
    console.log("[Reminder] Event has no start time:", event.summary);
    return;
  }

  console.log("[Reminder] Scheduling reminder for event:", event.summary);

  const reminderTime = new Date(event.start);
  reminderTime.setHours(reminderTime.getHours() - 24); // Subtract 24 hours

  const reminderPayload: ReminderPayload = {
    eventId: event.id,
    reminderTime: reminderTime.toISOString(),
  };

  const response = await publishQStashMessage(
    getUnixTime(reminderTime),
    reminderPayload
  );
  return response;
}
