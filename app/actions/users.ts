"use server";
import db from "@/app/db";
import { users } from "@/app/db/schema";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cache } from "react";

// used for assignee dropdown
export async function getUsers() {
  const users = await db.query.users.findMany();

  return users;
}

export async function clerkIdToSerialId(inputedClerkId?: string) {
  let clerkId = inputedClerkId;

  if (!clerkId) {
    const authData = await auth();
    if (!authData?.userId) {
      throw new Error("Unauthorized");
    }
    clerkId = authData.userId;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.id;
}

export const isUserOnboarded = cache(async (): Promise<boolean> => {
  const authData = await auth();
  if (!authData?.userId) {
    return false;
  }

  const user = await (await clerkClient()).users.getUser(authData.userId);
  return user.publicMetadata.onboarded === true;
});

export async function updateUserOnboardedStatus(onboarded: boolean) {
  const authData = await auth();
  if (!authData?.userId) {
    throw new Error("Unauthorized");
  }

  // Update Clerk metadata
  await (
    await clerkClient()
  ).users.updateUserMetadata(authData.userId, {
    publicMetadata: {
      onboarded,
    },
  });
}

/**
 * Update the user's onboarding status in Clerk metadata
 */
export async function updateUserOnboardingStatus(onboarded: boolean) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("No user found");
    }

    await (
      await clerkClient()
    ).users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        onboarded,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[updateUserOnboardingStatus] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update onboarding status",
    };
  }
}
