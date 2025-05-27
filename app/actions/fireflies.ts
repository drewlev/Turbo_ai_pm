"use server";

import { auth } from "@clerk/nextjs/server";
import db from "@/app/db";
import { users, userSettings } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { clerkIdToSerialId } from "./users";

export async function saveFirefliesApiKey(apiKey: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error("Not authenticated");
  }

  const userId = await clerkIdToSerialId(clerkId);
  if (!userId) {
    throw new Error("User not found");
  }

  // Update the user's public metadata with the Fireflies API key
  await db
    .insert(userSettings)
    .values({
      userId: userId,
      firefliesApiKey: apiKey,
    })
    .onConflictDoUpdate({
      target: [userSettings.userId],
      set: {
        firefliesApiKey: apiKey,
      },
    });

  return { success: true };
}

export async function getFirefliesApiKey(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      userSettings: true,
    },
  });

  return user?.userSettings?.firefliesApiKey || null;
}

export async function hasFirefliesApiKey() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error("Not authenticated");
  }

  const userId = await clerkIdToSerialId(clerkId);
  if (!userId) {
    throw new Error("User not found");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      userSettings: true,
    },
  });

  return !!user?.userSettings?.firefliesApiKey;
}

// returns users id
export async function getFirefliesWebhookUrl() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error("Not authenticated");
  }

  const userId = await clerkIdToSerialId(clerkId);
  if (!userId) {
    throw new Error("User not found");
  }
  return userId;
}