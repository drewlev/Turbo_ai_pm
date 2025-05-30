// app/actions/settings/calendar-event-tracking.ts

"use server";
import db from "@/app/db";
import { calendarEventKeywords, googleCalendar } from "@/app/db/schema"; // Your schema with unique(userId, keyword)
import { eq, inArray, and } from "drizzle-orm"; // Need 'and' for combining conditions
import { auth } from "@clerk/nextjs/server";
import { clerkIdToSerialId } from "../users";

// For webhook/background contexts where we have channelId
export async function getTrackingKeywordsByResourceId(resourceId: string) {
  // find user usering resourceId
  const calendarRecord = await db.query.googleCalendar.findFirst({
    where: eq(googleCalendar.resourceId, resourceId),
    with: {
      user: true,
    },
  });

  if (!calendarRecord?.user?.id) throw new Error("User not found");

  const userId = calendarRecord.user.id;

  const result = await db
    .select({ keyword: calendarEventKeywords.keyword })
    .from(calendarEventKeywords)
    .where(eq(calendarEventKeywords.userId, userId));

  return result.map((rec) => rec.keyword);
}

// For authenticated user contexts (settings page)
export async function saveTrackingKeywords(keywords: string[]) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated");

  const userId = await clerkIdToSerialId(clerkId);
  if (!userId) throw new Error("User not found");

  await db.transaction(async (tx) => {
    // 1. Get existing keywords for this user
    const existingKeywordRecords = await tx
      .select({ keyword: calendarEventKeywords.keyword })
      .from(calendarEventKeywords)
      .where(eq(calendarEventKeywords.userId, userId));

    const existingKeywords = existingKeywordRecords.map((rec) => rec.keyword);

    // 2. Determine keywords to delete and keywords to add
    const keywordsToDelete = existingKeywords.filter(
      (existingK) => !keywords.includes(existingK)
    );
    const keywordsToAdd = keywords.filter(
      (newK) => !existingKeywords.includes(newK)
    );

    // 3. Delete removed keywords
    if (keywordsToDelete.length > 0) {
      await tx
        .delete(calendarEventKeywords)
        .where(
          and(
            eq(calendarEventKeywords.userId, userId),
            inArray(calendarEventKeywords.keyword, keywordsToDelete)
          )
        );
    }

    // 4. Insert new keywords
    if (keywordsToAdd.length > 0) {
      const valuesToInsert = keywordsToAdd.map((k) => ({
        userId: userId,
        keyword: k,
      }));
      await tx
        .insert(calendarEventKeywords)
        .values(valuesToInsert)
        .onConflictDoNothing();
    }
  });
}

// For authenticated user contexts (settings page)
export async function getTrackingKeywords() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated");

  const userId = await clerkIdToSerialId(clerkId);
  if (!userId) throw new Error("User not found");

  const result = await db
    .select({ keyword: calendarEventKeywords.keyword })
    .from(calendarEventKeywords)
    .where(eq(calendarEventKeywords.userId, userId));

  return result.map((rec) => rec.keyword);
}
