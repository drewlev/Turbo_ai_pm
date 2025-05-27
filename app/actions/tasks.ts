"use server";

import db from "@/app/db";
import { tasks, taskAssignees, users, looms } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Types
export type TaskWithAssigneesType = typeof tasks.$inferSelect & {
  taskAssignees: (typeof taskAssignees.$inferSelect & {
    user: typeof users.$inferSelect;
  })[];
  looms?: (typeof looms.$inferSelect)[];
};

export type InsertTask = typeof tasks.$inferInsert & {
  assigneeID?: number[];
  meetingId?: number;
};

export type TaskResponse = {
  success: boolean;
  taskId?: number;
  task?: TaskWithAssigneesType;
  assignedUsers?: (typeof taskAssignees.$inferSelect)[];
  message?: string;
  error?: string;
};

// Task Queries
export async function getTasks(): Promise<TaskWithAssigneesType[]> {
  try {
    return await db.query.tasks.findMany({
      with: {
        taskAssignees: {
          with: {
            user: true,
          },
        },
        project: true,
        looms: true,
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
}

export async function getTasksByProjectId(
  projectId: number
): Promise<TaskWithAssigneesType[]> {
  try {
    return await db.query.tasks.findMany({
      where: eq(tasks.projectId, projectId),
      with: {
        taskAssignees: {
          with: {
            user: true,
          },
        },
        looms: true,
      },
    });
  } catch (error) {
    console.error(`Error fetching tasks for project ${projectId}:`, error);
    throw new Error("Failed to fetch project tasks");
  }
}

export async function getAvailableAssignees() {
  try {
    return await db.query.users.findMany({});
  } catch (error) {
    console.error("Error fetching available assignees:", error);
    throw new Error("Failed to fetch available assignees");
  }
}

// Task Mutations
export async function createTask(
  task: InsertTask
): Promise<TaskWithAssigneesType> {
  try {
    const [newTask] = await db
      .insert(tasks)
      .values({
        title: task.title,
        description: task.description,
        priority: task.priority,
        projectId: task.projectId,
        dueDate: task.dueDate,
        meetingId: task.meetingId,
      })
      .returning();

    if (!newTask) {
      throw new Error("Failed to create task");
    }
    return newTask;
  } catch (error) {
    console.error("Error creating task:", error);
    throw new Error(
      `Failed to create task: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function updateTaskAssignees(
  taskId: number,
  assigneeIds: number[]
): Promise<boolean> {
  try {
    await db.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId));

    if (assigneeIds?.length > 0) {
      const valuesToInsert = assigneeIds.map((userId) => ({ taskId, userId }));
      await db.insert(taskAssignees).values(valuesToInsert);
    }

    revalidatePath("/");
    return true;
  } catch (error) {
    console.error("Error updating task assignees:", error);
    throw new Error(
      `Failed to update task assignees: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function updateTask(
  taskId: number,
  taskData: Partial<InsertTask>
): Promise<TaskWithAssigneesType | null> {
  try {
    const { assigneeID, ...taskUpdateData } = taskData;

    const [updatedTask] = await db
      .update(tasks)
      .set(taskUpdateData)
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask) {
      throw new Error(`Failed to update task ${taskId}`);
    }

    if (assigneeID) {
      await updateTaskAssignees(taskId, assigneeID);
    }

    revalidatePath("/");
    return updatedTask;
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error(
      `Failed to update task: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function assignTask(
  taskId: number,
  assigneeIds: number[],
  meetingId?: number
): Promise<(typeof taskAssignees.$inferSelect)[]> {
  if (!assigneeIds?.length) {
    return [];
  }

  try {
    const valuesToInsert = assigneeIds.map((userId) => ({
      taskId,
      userId,
      meetingId,
    }));
    return await db.insert(taskAssignees).values(valuesToInsert).returning();
  } catch (error) {
    console.error("Error assigning task:", error);
    throw new Error(
      `Failed to assign task: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function createTaskAndAssign(
  taskData: InsertTask
): Promise<TaskResponse> {
  try {
    const newTask = await createTask(taskData);
    if (!newTask) {
      throw new Error("Task creation failed");
    }

    let assignedUsers: (typeof taskAssignees.$inferSelect)[] = [];
    if (taskData.assigneeID?.length) {
      assignedUsers = await assignTask(
        newTask.id,
        taskData.assigneeID,
        taskData.meetingId
      );
    }

    return {
      success: true,
      taskId: newTask.id,
      task: newTask,
      assignedUsers,
      message: "Task created and assigned successfully",
    };
  } catch (error) {
    console.error("Error in createTaskAndAssign:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
