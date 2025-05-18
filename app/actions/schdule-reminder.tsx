"use server";

import { headers } from "next/headers";
import { format, subHours, getUnixTime } from "date-fns";
import { Client } from "@upstash/qstash";

const postUrl = process.env.NEXTAUTH_URL + "/api/qstash";
interface Attendee {
  self?: boolean;
  email?: string | null;
  organizer?: boolean;
  responseStatus?: string;
}


// Initialize the Upstash Qstash client
const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
});

const qstashUrl = process.env.NEXTAUTH_URL + "/api/qstash";
export async function publishQStashMessage(
  url: string,
  body: string,
  delaySeconds: number,
  deduplicationId: string
) {
  const response = await qstash.schedules.create({
    destination: qstashUrl,
    cron: "0 9 * * *",
  });

  console.log(response);
  return response;
}

// Assume you have a function to check if an email is a project member
async function isProjectMember(email: string): Promise<boolean> {
  // Replace this with your actual logic to check project membership
  console.log(`Checking project membership for ${email}`);
  return email === "drew@quiib.com"; // Example: Only drew@quiib.com is a member
}

export async function scheduleSlackReminders(
  scheduledTimeISO: string,
  attendees: Attendee[]
) {
  try {
    // Parse the scheduled time using date-fns
    const scheduledDT = new Date(scheduledTimeISO);

    // Calculate the reminder time (24 hours before) using date-fns
    const reminderTime = subHours(scheduledDT, 24);

    // Get Unix timestamps for comparison and Qstash delay
    const reminderTimeUnix = getUnixTime(reminderTime);
    const nowUnix = getUnixTime(new Date());

    const headersList = headers();
    // const pathname = headersList.get('next-url') // You might need this for revalidation

    for (const attendee of attendees) {
      const email = attendee.email;
      if (email && (await isProjectMember(email))) {
        const payload = {
          url: process.env.NEXTAUTH_URL + "/api/reminder",
          method: "POST",
          body: JSON.stringify({
            attendeeEmail: email,
            scheduledFor: scheduledTimeISO,
          }),
        };

        const delaySeconds = reminderTimeUnix - nowUnix;

        if (delaySeconds > 0) {
          const deduplicationId = `reminder-${scheduledTimeISO}-${email
            .replace("@", "-at-")
            .replace(".", "-dot-")}`;

          const response = await publishQStashMessage(
            payload.url,
            payload.body,
            delaySeconds,
            deduplicationId
          );

          if (!response) {
            console.error(`Qstash error for ${email}`);
          } else {
            console.log(
              `Scheduled reminder for ${email} at ${format(
                reminderTime,
                "yyyy-MM-dd HH:mm:ss"
              )}`
            );
          }
        } else {
          console.log(`Reminder time for ${email} is in the past, skipping.`);
        }
      }
    }

    // Optionally revalidate data if needed
    // revalidatePath('/some-path');
  } catch (error) {
    console.error("Error scheduling reminders:", error);
    return { error: "Failed to schedule reminders" };
  }
}
