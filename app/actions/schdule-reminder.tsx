"use server";

import { headers } from "next/headers";
import { format, subHours, getUnixTime } from "date-fns";
import { Client } from "@upstash/qstash";

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

const scheduledTime = Math.floor(Date.now() / 1000) + 60; // Calculate 1 minute from now in Unix timestamp
const payload = { your: "payload" };

export async function publishQStashMessage() {
  const response = await qstash.publishJSON({
    url: qstashUrl,
    body: payload,
    notBefore: scheduledTime,
  });

  console.log(response);
  return response;
}


export async function scheduleReminder() {
  const eventKeyWords = ["design review", "kick off"]

  

}