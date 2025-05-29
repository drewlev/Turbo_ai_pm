"use server";

import db from "@/app/db";
import { slackInstallations, slackUsers, users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { clerkIdToSerialId } from "./users";
import {
  SlackApiResponse,
  SlackInstall,
  SlackOAuthResponse,
} from "@/app/types/slack";

// Constants
const SLACK_API_BASE = "https://slack.com/api";
const SLACK_WEBHOOK_BASE = process.env.SLACK_WEBHOOK_URL;

// Error classes
class SlackError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "SlackError";
  }
}

// Helper functions
async function handleSlackApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new SlackError(
      errorData.error || response.statusText,
      errorData.code
    );
  }
  return response.json();
}

// Main functions
export const sendMessageToSlack = async (
  message: string,
  userId: number

): Promise<SlackApiResponse<unknown>> => {
  try {
    const slackUser = await db.query.slackUsers.findFirst({
      where: eq(slackUsers.userId, userId),
      with: {
        slackInstallation: true,

      },
    });

    if (!slackUser) {
      throw new SlackError("Slack user not found");
    }

    const response = await fetch(`${SLACK_WEBHOOK_BASE}/send-reminders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        slackUserId: slackUser.slackUserId,
        teamId: slackUser.slackTeamId,
        botToken: slackUser.slackInstallation?.botToken,
      }),
    });

    const data = await handleSlackApiResponse(response);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending message to Slack:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send message",
    };
  }
};

export const createSlackOAuthUrl = async (): Promise<string> => {
  const userId = await clerkIdToSerialId();
  const encodedState = btoa(JSON.stringify({ userId }));

  return `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=users:read,users:read.email&user_scope=users:read,users:read.email&redirect_uri=${process.env.SLACK_REDIRECT_URI}&state=${encodedState}`;
};

export const assignSlackUser = async (
  slackCode: string,
  state: string
): Promise<SlackApiResponse<any>> => {
  try {
    const decodedState = JSON.parse(atob(state));
    const userId = decodedState.userId;

    const tokenRes = await fetch(`${SLACK_API_BASE}/oauth.v2.access`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: slackCode,
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        redirect_uri: process.env.SLACK_REDIRECT_URI!,
      }),
    });

    const slackData: SlackOAuthResponse = await handleSlackApiResponse(
      tokenRes
    );
    const { id: slackUserId } = slackData.authed_user;
    const teamId = slackData.team.id;

    const [slackUser] = await db
      .insert(slackUsers)
      .values({
        userId,
        slackUserId,
        slackTeamId: teamId,
        slackTeamName: slackData.team.name,
        slackAccessToken: slackData.authed_user.access_token,
      })
      .onConflictDoUpdate({
        target: slackUsers.slackUserId,
        set: {
          slackUserId,
          slackTeamId: teamId,
          slackTeamName: slackData.team.name,
          slackAccessToken: slackData.authed_user.access_token,
        },
      })
      .returning();

    const slackUserWithUserData = await db.query.slackUsers.findFirst({
      where: eq(slackUsers.id, slackUser.id),
      with: {
        user: {
          columns: {
            id: true,
            teamId: true,
          },
        },
      },
    });

    if (!slackUserWithUserData) {
      throw new SlackError("Failed to retrieve slack user data");
    }

    const botInstallation = await db.query.slackInstallations.findFirst({
      where: eq(slackInstallations.slackTeamId, teamId),
    });

    if (
      botInstallation &&
      !botInstallation.team &&
      slackUserWithUserData.user?.teamId
    ) {
      await db
        .update(slackInstallations)
        .set({ team: slackUserWithUserData.user.teamId })
        .where(eq(slackInstallations.slackTeamId, teamId));
    }

    return { success: true, data: slackUserWithUserData };
  } catch (error) {
    console.error("Error assigning Slack user:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to assign Slack user",
    };
  }
};

export const saveSlackInstall = async (
  slackInstall: SlackInstall
): Promise<SlackApiResponse<any>> => {
  try {
    const [installation] = await db
      .insert(slackInstallations)
      .values({
        slackTeamId: slackInstall.teamId,
        teamName: slackInstall.teamName,
        botToken: slackInstall.botToken,
        installerUserId: slackInstall.installerUserId,
      })
      .onConflictDoUpdate({
        target: slackInstallations.slackTeamId,
        set: {
          teamName: slackInstall.teamName,
          botToken: slackInstall.botToken,
          installerUserId: slackInstall.installerUserId,
        },
      })
      .returning();

    const existingUser = await db.query.slackUsers.findFirst({
      where: eq(slackUsers.slackTeamId, slackInstall.teamId),
      with: {
        user: true,
      },
    });

    if (existingUser?.user?.teamId) {
      await db
        .update(slackInstallations)
        .set({ team: existingUser.user.teamId })
        .where(eq(slackInstallations.slackTeamId, slackInstall.teamId));
    }

    return { success: true, data: installation };
  } catch (error) {
    console.error("Error saving Slack installation:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save Slack installation",
    };
  }
};
