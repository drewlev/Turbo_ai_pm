"use server";

import db from "@/app/db";
import { slackUsers } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { clerkIdToSerialId } from "./users";

interface SlackOAuthResponse {
  ok: boolean;
  app_id: string;
  authed_user: {
    id: string;
    scope: string; // Comma-separated scopes
    access_token: string;
    token_type: string; // Typically 'user'
  };
  scope: string; // Comma-separated scopes for the bot/app
  token_type: string; // Typically 'bot'
  access_token: string; // Bot's access token
  bot_user_id: string;
  team: {
    id: string;
    name: string;
  };
  enterprise: null | any; // Can be null or an object if it's an enterprise install
  is_enterprise_install: boolean;
}

export const sendMessageToSlack = async (message: string, userId: number) => {
  //   const slackUserId = user.slackUserId;
  const slackUser = await db.query.slackUsers.findFirst({
    where: eq(slackUsers.userId, userId),
    with: {
      slackInstallation: true,
    },
  });

  console.log({ slackUser });

  if (!slackUser) {
    throw new Error("Slack user not found");
  }

  try {
    console.log(
      "Sending request to:",
      process.env.SLACK_WEBHOOK_URL + "/send-reminders"
    );
    console.log("Request payload:", {
      message,
      slackUserId: slackUser.slackUserId,
      teamId: slackUser.slackTeamId,
    });

    const response = await fetch(
      process.env.SLACK_WEBHOOK_URL + "/send-reminders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          slackUserId: slackUser.slackUserId,
          teamId: slackUser.slackTeamId,
          botToken: "placeholder",
        }),
      }
    );

    console.log("Response status:", response.status);
    const responseData = await response.json();
    console.log("Response data:", responseData);

    if (!response.ok) {
      throw new Error(
        `Failed to send message: ${responseData.error || response.statusText}`
      );
    }

    return responseData;
  } catch (error) {
    console.error("Error sending message to Slack:", error);
    throw error;
  }
};

export const createSlackOAuthUrl = async () => {
  const userId = await clerkIdToSerialId();

  // Encode the state as base64 to make it URL-safe
  const encodedState = btoa(JSON.stringify({ userId }));
  const slackuri = process.env.SLACK_REDIRECT_URI;
  const slackClientId = process.env.SLACK_CLIENT_ID;

  const slackOAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${slackClientId}&scope=users:read,users:read.email&user_scope=users:read,users:read.email&redirect_uri=${slackuri}&state=${encodedState}`;

  return slackOAuthUrl;
};

export const assignSlackUser = async (slackCode: string, state: string) => {
  const decodedState = JSON.parse(atob(state));
  const userId = decodedState.userId;
  console.log({ userId });
  // const userId = await clerkIdToSerialId(clerkId);

  //hit slack to get code
  const tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: slackCode,
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      redirect_uri: process.env.SLACK_REDIRECT_URI!,
    }),
  });

  console.log(tokenRes);
  const slackData: SlackOAuthResponse = await tokenRes.json();
  console.log({ slackData });
  const slackUserId = slackData.authed_user.id;
  const teamId = slackData.team.id;

  // Use upsert operation to either insert or update the slack user
  const user = await db
    .insert(slackUsers)
    .values({
      userId: userId,
      slackUserId: slackUserId,
      slackTeamId: teamId,
      slackTeamName: slackData.team.name,
      slackAccessToken: slackData.authed_user.access_token,
    })
    .onConflictDoUpdate({
      target: slackUsers.slackUserId,
      set: {
        slackUserId: slackUserId,
        slackTeamId: teamId,
        slackTeamName: slackData.team.name,
        slackAccessToken: slackData.authed_user.access_token,
      },
    });

  if (!user) {
    throw new Error("Failed to update or insert slack user");
  }

  return { message: "success" };
};
