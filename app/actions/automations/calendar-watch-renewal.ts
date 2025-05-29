"use server";
import { and, eq, lt, gt } from "drizzle-orm";
import db from "@/app/db";
import { googleCalendar } from "@/app/db/schema";
import { watchCalendar, stopWatchingCalendar } from "../google-calendar";
import { publishQStashCron, publishQStashMessage } from "../schdule-reminder";
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
    const user = await currentUser();
    if (!user) {
      console.error("[onboardUserCalendar] No user found");
      return { success: false, error: "No user found" };
    }
    const userId = await clerkIdToSerialId(user.id);

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
    const { watchRecord } = await watchCalendar();

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
async function scheduleCalendarWatchRenewal(
  watch: typeof googleCalendar.$inferSelect
) {
  console.log(
    `[scheduleCalendarWatchRenewal] Scheduling weekly renewal for watch ${watch.id}`
  );

  // Schedule the renewal with QStash to run weekly on Sunday at midnight
  await publishQStashCron(
    "0 0 * * 0", // Run at midnight every Sunday
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
    `[scheduleCalendarWatchRenewal] Successfully scheduled weekly renewal for watch ${watch.id}`
  );
}

/**
 * Process a calendar watch renewal
 * This is called by the QStash cron job
 */
async function processCalendarWatchRenewal(watchId: number) {
  console.log(
    `[processCalendarWatchRenewal] Processing renewal for watch ${watchId}`
  );

  const watch = await db.query.googleCalendar.findFirst({
    where: eq(googleCalendar.id, watchId),
    with: {
      user: true,
    },
  });

  if (!watch) {
    console.error(`[processCalendarWatchRenewal] Watch ${watchId} not found`);
    return;
  }

  try {
    // Stop the existing watch
    await stopWatchingCalendar(watch.channelId, watch.resourceId);

    // Start a new watch
    const newWatch = await watchCalendar();

    // Update the watch record with new details
    await db
      .update(googleCalendar)
      .set({
        channelId: newWatch.watchResponse.channelId,
        resourceId: newWatch.watchResponse.resourceId,
        resourceUri: newWatch.watchResponse.resourceUri,
        expiration: new Date(Number(newWatch.watchResponse.expiration)),
      })
      .where(eq(googleCalendar.id, watch.id));

    console.log(
      `[processCalendarWatchRenewal] Successfully renewed watch ${watchId}`
    );
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
