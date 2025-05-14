import db from "@/app/db";
import { users } from "@/app/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";


// used for assignee dropdown
export async function getUsers() {
  const users = await db.query.users.findMany();
  
  return users;
}

export async function clerkIdToSerialId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error("Unauthorized");
  }
  const userSerialId = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!userSerialId) {
    throw new Error("User not found");
  }
  return userSerialId.id;
}