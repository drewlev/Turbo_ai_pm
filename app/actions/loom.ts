"use server";
import db from "@/app/db";
import { looms, tasks, users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { clerkIdToSerialId } from "./users";
import { revalidatePath } from "next/cache";
// export async function getLoomByProjectId(projectId: number) {
//   const loom = await db.query.looms.findMany({
//     where: eq(looms.taskId, taskId),
//   });
//   return loom;
// }

export async function addLoomToTask(taskId: number, loomUrl: string) {
  try {
    const userId = await clerkIdToSerialId();
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!task) {
      throw new Error("Task not found");
    }

    const [newLoom] = await db
      .insert(looms)
      .values({
        loomUrl,
        taskId: task.id,
        userId,
      })
      .returning();

    revalidatePath("/");
    return { success: true, message: "Loom added to task!", updatedTask: task };
  } catch (error: any) {
    console.error("Error adding Loom to task:", error);
    return {
      success: false,
      message: "Failed to add Loom. Please try again.",
    };
  }
}

export async function deleteLoomFromTask(taskId: number) {
  try {
    const userId = await clerkIdToSerialId();

    // Delete the loom associated with the task
    await db.delete(looms).where(eq(looms.taskId, taskId));

    revalidatePath("/");
    return { success: true, message: "Loom deleted successfully!" };
  } catch (error: any) {
    console.error("Error deleting Loom:", error);
    return {
      success: false,
      message: "Failed to delete Loom. Please try again.",
    };
  }
}
