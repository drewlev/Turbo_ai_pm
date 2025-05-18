import db from "@/app/db";
import { users } from "@/app/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

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
