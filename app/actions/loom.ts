"user server"
import db from "@/app/db";
import { looms, users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { clerkIdToSerialId } from "./users";
export async function getLoomByProjectId(projectId: number) {
  const loom = await db.query.looms.findMany({ where: eq(looms.projectId, projectId) });
  return loom;
}

export async function createLoom(loomUrl: string, projectId: number) {
  const userId = await clerkIdToSerialId();

  const loom = await db.insert(looms).values({ loomUrl, projectId, userId }).returning();
  return loom;
}
