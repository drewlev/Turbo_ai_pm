// app/actions/settings/calendar-event-tracking.ts

"use server";
import db from "@/app/db";
import { calendarEventKeywords } from "@/app/db/schema"; // Your schema with unique(userId, keyword)
import { eq, inArray, and } from "drizzle-orm"; // Need 'and' for combining conditions
import { auth } from "@clerk/nextjs/server";
import { clerkIdToSerialId } from "../users";

export async function saveTrackingKeywords(keywords: string[]) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated");

  const userId = await clerkIdToSerialId(clerkId);
  if (!userId) throw new Error("User not found");

  await db.transaction(async (tx) => { // Use a transaction for atomicity
    // 1. Get existing keywords for this user
    const existingKeywordRecords = await tx
      .select({ keyword: calendarEventKeywords.keyword })
      .from(calendarEventKeywords)
      .where(eq(calendarEventKeywords.userId, userId));

    const existingKeywords = existingKeywordRecords.map((rec) => rec.keyword);

    // 2. Determine keywords to delete and keywords to add
    // Keywords that are currently in the DB but NOT in the new 'keywords' array
    const keywordsToDelete = existingKeywords.filter(
      (existingK) => !keywords.includes(existingK)
    );
    // Keywords that are in the new 'keywords' array but NOT currently in the DB
    const keywordsToAdd = keywords.filter(
      (newK) => !existingKeywords.includes(newK)
    );

    // 3. Delete removed keywords
    if (keywordsToDelete.length > 0) {
      await tx
        .delete(calendarEventKeywords)
        .where(
          and( // Use 'and' to combine conditions
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
      // Use onConflictDoNothing because of the unique(userId, keyword) constraint
      // If a keyword somehow already exists (e.g., race condition), just skip it.
      await tx.insert(calendarEventKeywords).values(valuesToInsert).onConflictDoNothing();
    }
  });
}

export async function getTrackingKeywords() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated");

  const userId = await clerkIdToSerialId(clerkId);
  if (!userId) throw new Error("User not found");

  const result = await db
    .select({ keyword: calendarEventKeywords.keyword }) // Select only the 'keyword' column
    .from(calendarEventKeywords)
    .where(eq(calendarEventKeywords.userId, userId));

  // No need to split, as each row is already a single keyword
  return result.map((rec) => rec.keyword);
}