"use server";

import db from "@/app/db";
import { tasks } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function getTasks() {
  const tasks = await db.query.tasks.findMany();
  return tasks;
}

type InsertTask = (typeof tasks.$inferInsert & {
  assigneeID?: number[];
})[];

export async function createTask(task: InsertTask) {
  console.log("task", task);
  //   const [newTask] = await db.insert(tasks).values(task).returning();
  return task;
}
