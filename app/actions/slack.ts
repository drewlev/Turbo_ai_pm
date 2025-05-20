"use server";

import  db  from "@/app/db";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export const sendMessageToSlack = async (message: string, userId: number) => {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user) {
        throw new Error("User not found");
    }
  const slackUserId = user.slackUserId;
    try {
      console.log("Sending request to:", process.env.SLACK_WEBHOOK_URL + "/send-reminders");
      console.log("Request payload:", { message, slackUserId });
  
      const response = await fetch(process.env.SLACK_WEBHOOK_URL + "/send-reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, slackUserId }),
      });
  
      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);
  
      if (!response.ok) {
        throw new Error(`Failed to send message: ${responseData.error || response.statusText}`);
      }
  
      return responseData;
    } catch (error) {
      console.error("Error sending message to Slack:", error);
      throw error;
    }
  };