"use server";

import { getUnixTime } from "date-fns";
import { Client } from "@upstash/qstash";
import { EventType } from "@/lib/google-calendar";
import { getTrackingKeywordsByResourceId } from "./settings/calendar-event-tracking";

// Constants
const LOG_PREFIX = "[Reminder]";
const REMINDER_HOURS_BEFORE = 24;

// Initialize the Upstash Qstash client
const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
});

const qstashUrl = process.env.NEXTAUTH_URL + "/api/qstash";

// Custom error classes
class ReminderError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "ReminderError";
  }
}

class QStashError extends ReminderError {
  constructor(message: string) {
    super(message, "QSTASH_ERROR");
    this.name = "QStashError";
  }
}

// Type definitions
interface ReminderPayload {
  eventId: string;
  reminderTime: string;
}

interface QStashMessageResponse {
  messageId: string;
  [key: string]: any;
}

interface QStashScheduleResponse {
  scheduleId: string;
  [key: string]: any;
}

type QStashResponse = QStashMessageResponse | QStashScheduleResponse;

// Utility functions
function logInfo(message: string, ...args: any[]) {
  console.log(`${LOG_PREFIX} ${message}`, ...args);
}

function logError(message: string, error: any) {
  console.error(`${LOG_PREFIX} ${message}:`, error);
}

// Main functions
export async function publishQStashMessage(
  notBefore: number,
  payload: ReminderPayload
): Promise<QStashMessageResponse> {
  try {
    const response = await qstash.publishJSON({
      url: qstashUrl,
      body: payload,
      notBefore,
    });
    logInfo("Message published successfully:", response);
    return response as QStashMessageResponse;
  } catch (error) {
    logError("Failed to publish message", error);
    throw new QStashError("Failed to publish QStash message");
  }
}

export async function publishQStashCron<T>(
  cron: string,
  payload: T,
  endpoint: string
): Promise<QStashScheduleResponse> {
  try {
    const response = await qstash.schedules.create({
      cron,
      body: JSON.stringify(payload),
      destination: qstashUrl + endpoint,
    });
    logInfo("Message published successfully:", response);
    return response as QStashScheduleResponse;
  } catch (error) {
    logError("Failed to publish message", error);
    throw new QStashError("Failed to publish QStash cron message");
  }
}

export async function cancelReminder(messageId: string): Promise<Response> {
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
    logInfo("Message deleted successfully:", response);
    return response;
  } catch (error) {
    logError("Failed to delete message", error);
    throw new QStashError("Failed to delete QStash message");
  }
}

// This schdulels a reminder specofic events like  a design review or kick off event
export async function scheduleReminder(
  event: EventType,
  resourceId: string
): Promise<QStashMessageResponse | undefined> {
  logInfo("Checking event for tracking keywords:", event.summary);

  // Get tracking keywords for this resource
  const keywords = await getTrackingKeywordsByResourceId(resourceId);
  logInfo("Found tracking keywords:", keywords);

  const isRelevantEvent = keywords.some((keyword: string) =>
    event.summary.toLowerCase().includes(keyword.toLowerCase())
  );

  if (!isRelevantEvent) {
    logInfo("Event does not match any tracking keywords:", event.summary);
    return;
  }

  if (!event.start) {
    logInfo("Event has no start time:", event.summary);
    return;
  }

  logInfo("Scheduling reminder for event:", event.summary);

  const reminderTime = new Date(event.start);
  reminderTime.setHours(reminderTime.getHours() - REMINDER_HOURS_BEFORE);

  const reminderPayload: ReminderPayload = {
    eventId: event.id,
    reminderTime: reminderTime.toISOString(),
  };

  return await publishQStashMessage(getUnixTime(reminderTime), reminderPayload);
}
