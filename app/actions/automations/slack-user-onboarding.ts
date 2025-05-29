"use server";
import { currentUser } from "@clerk/nextjs/server";
import db from "@/app/db";
import { slackUsers } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { clerkIdToSerialId } from "../users";

// ===== Onboarding Functions =====

/**
 * Check if a user has an active Slack connection
 */
export async function checkSlackConnectionStatus() {
  try {
    const user = await currentUser();
    if (!user) {
      return { connected: false, error: "No user found" };
    }

    const userId = await clerkIdToSerialId(user.id);
    const existingSlackUser = await db.query.slackUsers.findFirst({
      where: eq(slackUsers.userId, userId),
    });

    if (!existingSlackUser) {
      return {
        connected: false,
        message: "Please connect your slack workspace",
        status: "user-input-required",
      };
    }

    return {
      connected: true,
      slackUser: existingSlackUser,
      message: "Slack workspace connected",
    };
  } catch (error) {
    console.error("[checkSlackConnectionStatus] Error:", error);
    return {
      connected: false,
      error: "Failed to check Slack connection status",
    };
  }
}

/**
 * Initial onboarding function to set up Slack connection for a new user
 * This should be called during user onboarding
 */
export async function onboardUserSlack() {
  console.log("[onboardUserSlack] Starting Slack onboarding");

  try {
    const user = await currentUser();
    if (!user) {
      console.error("[onboardUserSlack] No user found");
      return { success: false, error: "No user found" };
    }

    const userId = await clerkIdToSerialId(user.id);
    const existingSlackUser = await db.query.slackUsers.findFirst({
      where: eq(slackUsers.userId, userId),
    });

    if (existingSlackUser) {
      console.log("[onboardUserSlack] User already has a Slack connection");
      return {
        success: true,
        slackUser: existingSlackUser,
        message: "Slack workspace already connected",
      };
    }

    // Note: The actual Slack user creation happens in the OAuth callback
    // This function just checks if the user is already connected
    return {
      success: false,
      error: "No Slack connection found",
      message: "Please connect your Slack workspace",
    };
  } catch (error) {
    console.error("[onboardUserSlack] Error during Slack onboarding:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check Slack connection",
    };
  }
}
