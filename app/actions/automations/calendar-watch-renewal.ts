"use server";
import { and, eq, lt, gt } from "drizzle-orm";
import db from "@/app/db";
import { googleCalendar } from "@/app/db/schema";
import { watchCalendar, stopWatchingCalendar } from "../google-calendar";
import { publishQStashCron } from "../schdule-reminder";
import { clerkIdToSerialId } from "../users";
import { currentUser } from "@clerk/nextjs/server";

// ===== Onboarding Functions =====

/**
 * Check if a user has an active calendar connection
 */
async function checkCalendarConnectionStatus() {
  const user = await currentUser();
  if (!user) {
    return { connected: false, error: "No user found" };
  }

  try {
    const userId = await clerkIdToSerialId(user.id);
    const existingWatch = await db.query.googleCalendar.findFirst({
      where: eq(googleCalendar.userId, userId),
    });

    if (!existingWatch) {
      return { connected: false, error: "No calendar connection found" };
    }

    // Check if the watch is expired
    const now = new Date();
    if (existingWatch.expiration < now) {
      return { connected: false, error: "Calendar connection expired" };
    }

    return {
      connected: true,
      watchDetails: existingWatch,
      expiresAt: existingWatch.expiration,
    };
  } catch (error) {
    console.error("[checkCalendarConnectionStatus] Error:", error);
    return { connected: false, error: "Failed to check calendar status" };
  }
}

/**
 * Initial onboarding function to set up calendar watching for a new user
 * This should be called during user onboarding
 */
async function onboardUserCalendar() {
  console.log(`[onboardUserCalendar] Starting calendar onboarding for user`);

  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      console.error("[onboardUserCalendar] No user found");
      return { success: false, error: "No user found" };
    }
    const userId = await clerkIdToSerialId(clerkUser.id);

    const existingWatch = await db.query.googleCalendar.findFirst({
      where: eq(googleCalendar.userId, userId),
    });

    if (existingWatch) {
      console.log(`[onboardUserCalendar] User already has a watch`);
      return {
        success: true,
        watchDetails: existingWatch,
        message: "Calendar already connected",
      };
    }

    // Create the initial watch
    const { watchRecord } = await watchCalendar(clerkUser.id);

    // Schedule the weekly renewal
    await scheduleCalendarWatchRenewal(watchRecord);

    console.log(
      `[onboardUserCalendar] Successfully completed calendar onboarding`
    );
    return {
      success: true,
      watchDetails: watchRecord,
      message: "Calendar connected successfully",
    };
  } catch (error) {
    console.error(
      "[onboardUserCalendar] Error during calendar onboarding:",
      error
    );
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to connect calendar",
    };
  }
}

// ===== Watch Management Functions =====

/**
 * Schedule a weekly renewal for a calendar watch
 * This is called during onboarding and by the renewal process
 */
export async function scheduleCalendarWatchRenewal(
  watch: typeof googleCalendar.$inferSelect
) {
  console.log(
    `[scheduleCalendarWatchRenewal] Starting renewal scheduling for watch ${watch.id}`
  );

  try {
    // Schedule the renewal with QStash to run weekly on Sunday at midnight
    const response = await publishQStashCron(
      "0 0 * * 0", // QStash shorthand for weekly execution
      {
        eventId: `watch-renewal-${watch.id}`,
        watchId: watch.id,
        channelId: watch.channelId,
        resourceId: watch.resourceId,
        userId: watch.userId ?? undefined,
      },
      "/calendar-watch"
    );

    console.log(
      `[scheduleCalendarWatchRenewal] Successfully scheduled weekly renewal for watch ${watch.id}`,
      { response }
    );
    return response;
  } catch (error) {
    console.error(
      `[scheduleCalendarWatchRenewal] Failed to schedule renewal for watch ${watch.id}:`,
      error
    );
    throw error;
  }
}

/**
 * Process a calendar watch renewal
 * This is called by the QStash cron job
 */
async function processCalendarWatchRenewal(watchId: number) {
  console.log(
    `[processCalendarWatchRenewal] Starting renewal process for watch ${watchId}`
  );

  const watch = await db.query.googleCalendar.findFirst({
    where: eq(googleCalendar.id, watchId),
    with: {
      user: true,
    },
  });

  if (!watch) {
    console.error(`[processCalendarWatchRenewal] Watch ${watchId} not found`);
    throw new Error(`Watch ${watchId} not found`);
  }

  if (!watch.user?.clerkId) {
    console.error(
      `[processCalendarWatchRenewal] No clerkId found for watch ${watchId}`
    );
    throw new Error(`No clerkId found for watch ${watchId}`);
  }

  console.log(
    `[processCalendarWatchRenewal] Found watch for user ${watch.userId}`,
    { watch }
  );

  try {
    // Stop the existing watch
    console.log(
      `[processCalendarWatchRenewal] Stopping existing watch for channel ${watch.channelId}`
    );
    await stopWatchingCalendar(watch.channelId, watch.resourceId);

    // Start a new watch
    console.log(
      `[processCalendarWatchRenewal] Starting new watch for user ${watch.userId}`
    );
    const newWatch = await watchCalendar(watch.user.clerkId);

    // Delete the old watch record
    console.log(
      `[processCalendarWatchRenewal] Deleting old watch record ${watchId}`
    );
    await db.delete(googleCalendar).where(eq(googleCalendar.id, watch.id));

    console.log(
      `[processCalendarWatchRenewal] Successfully renewed watch ${watchId}`,
      { newWatch }
    );

    // Schedule the next renewal for the new watch
    await scheduleCalendarWatchRenewal(newWatch.watchRecord);

    return newWatch.watchRecord;
  } catch (error) {
    console.error(
      `[processCalendarWatchRenewal] Error renewing watch ${watchId}:`,
      error
    );
    throw error;
  }
}

// ===== Maintenance Functions =====

/**
 * Clean up expired watches
 * This is called by the QStash cron job
 */
async function cleanupExpiredWatches() {
  console.log("[cleanupExpiredWatches] Starting cleanup of expired watches");

  const now = new Date();

  // Find all watches that have expired
  const expiredWatches = await db.query.googleCalendar.findMany({
    where: lt(googleCalendar.expiration, now),
  });

  console.log(
    `[cleanupExpiredWatches] Found ${expiredWatches.length} expired watches`
  );

  for (const watch of expiredWatches) {
    try {
      console.log(
        `[cleanupExpiredWatches] Cleaning up expired watch for user ${watch.userId}`
      );

      // Stop the expired watch
      await stopWatchingCalendar(watch.channelId, watch.resourceId);

      // Delete the record from the database
      await db.delete(googleCalendar).where(eq(googleCalendar.id, watch.id));

      console.log(
        `[cleanupExpiredWatches] Successfully cleaned up watch for user ${watch.userId}`
      );
    } catch (error) {
      console.error(
        `[cleanupExpiredWatches] Error cleaning up watch for user ${watch.userId}:`,
        error
      );
      // Continue with other watches even if one fails
    }
  }
}

/**
 * Check and renew calendar watches
 * This is called by the QStash cron job
 */
async function checkAndRenewCalendarWatches() {
  console.log(
    "[checkAndRenewCalendarWatches] Starting weekly check for watches that need renewal"
  );

  const now = new Date();
  const oneWeekFromNow = new Date(now);
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

  // Find all watches that need renewal (expiring in the next week)
  const watchesToRenew = await db.query.googleCalendar.findMany({
    where: and(
      gt(googleCalendar.expiration, now),
      lt(googleCalendar.expiration, oneWeekFromNow)
    ),
  });

  console.log(
    `[checkAndRenewCalendarWatches] Found ${watchesToRenew.length} watches to renew`
  );

  for (const watch of watchesToRenew) {
    try {
      await processCalendarWatchRenewal(watch.id);
    } catch (error) {
      console.error(
        `[checkAndRenewCalendarWatches] Error processing watch ${watch.id}:`,
        error
      );
      // Continue with other watches even if one fails
    }
  }
}

// Export only the functions that should be called from outside
export {
  onboardUserCalendar,
  checkAndRenewCalendarWatches,
  cleanupExpiredWatches,
  checkCalendarConnectionStatus,
};
