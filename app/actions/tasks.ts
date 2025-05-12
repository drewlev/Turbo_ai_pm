"use server";

import db from "@/app/db";
import { tasks, taskAssignees, users } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function getTasks() {
  const tasks = await db.query.tasks.findMany({
    with: {
      taskAssignees: {
        with: {
          user: true,
        },
      },
    },
  });
  return tasks;
}

type InsertTask = typeof tasks.$inferInsert & {
  assigneeID?: number[];
};

export async function createTask(task: InsertTask) {
  try {
    const [newTask] = await db
      .insert(tasks)
      .values({
        title: task.title,
        description: task.description,
        priority: task.priority,
        projectId: task.projectId,
        dueDate: task.dueDate,
      })
      .returning();

    if (!newTask) {
      throw new Error("Failed to create task");
    }
    return newTask;
  } catch (error: any) {
    console.error("Error creating task:", error);
    throw new Error(`Failed to create task: ${error.message}`); // Re-throw for consistent error handling
  }
}

export async function assignTask(taskId: number, assigneeIds: number[]) {
  if (!assigneeIds || assigneeIds.length === 0) {
    return [];
  }

  try {
    const valuesToInsert = assigneeIds.map((userId) => ({ taskId, userId }));
    const newTaskAssignees = await db
      .insert(taskAssignees)
      .values(valuesToInsert)
      .returning();
    return newTaskAssignees;
  } catch (error: any) {
    console.error("Error assigning task:", error);
    throw new Error(`Failed to assign task: ${error.message}`); // Re-throw the error
  }
}

export async function createTaskAndAssign(taskData: InsertTask) {
  try {
    // 1. Create the task
    const newTask = await createTask(taskData);
    if (!newTask) {
      throw new Error("Task creation failed."); // Explicitly handle task creation failure
    }
    const taskId = newTask.id;

    // 2. Assign the task to users
    let assignedUsers: (typeof taskAssignees.$inferSelect)[] = [];
    if (taskData.assigneeID) {
      assignedUsers = await assignTask(taskId, taskData.assigneeID);
    }

    // 3. Return success data
    return {
      success: true,
      taskId: taskId,
      task: newTask,
      assignedUsers,
      message: "Task created and assigned successfully!",
    };
  } catch (error: any) {
    // Handle errors from createTask or assignTask
    console.error("Error in createTaskAndAssign:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
