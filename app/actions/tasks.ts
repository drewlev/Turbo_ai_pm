"use server";

import db from "@/app/db";
import { tasks, taskAssignees, users, looms } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type TaskWithAssigneesType = typeof tasks.$inferSelect & {
  taskAssignees: (typeof taskAssignees.$inferSelect & {
    user: typeof users.$inferSelect;
  })[];
  looms?: (typeof looms.$inferSelect)[];
};

// Get all tasks
export async function getTasks(): Promise<TaskWithAssigneesType[]> {
  const tasks = await db.query.tasks.findMany({
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
  return tasks;
}

export async function getAvailableAssignees() {
  const availableAssignees = await db.query.users.findMany({});
  return availableAssignees;
}

// get taks based on project id
export async function getTasksByProjectId(
  projectId: number
): Promise<TaskWithAssigneesType[]> {
  const projectTasks = await db.query.tasks.findMany({
    where: eq(tasks.projectId, projectId),
    with: {
      taskAssignees: {
        with: {
          user: true,
        },
      },
    },
  });
  return projectTasks;
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

export async function updateTaskAssignees(
  taskId: number,
  assigneeIds: number[]
) {
  try {
    // First, delete existing assignees
    await db.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId));

    // Then, add new assignees if there are any
    if (assigneeIds && assigneeIds.length > 0) {
      const valuesToInsert = assigneeIds.map((userId) => ({ taskId, userId }));
      await db.insert(taskAssignees).values(valuesToInsert);
    }

    revalidatePath("/");
    return true;
  } catch (error: any) {
    console.error("Error updating task assignees:", error);
    throw new Error(`Failed to update task assignees: ${error.message}`);
  }
}

export async function updateTask(
  taskId: number,
  taskData: Partial<InsertTask>
) {
  console.log("Updating task:", taskId, taskData);
  try {
    // Extract assigneeIds from taskData
    const { assigneeID, ...taskUpdateData } = taskData;

    // Update the task
    const [updatedTask] = await db
      .update(tasks)
      .set(taskUpdateData)
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask) {
      console.error(`Failed to update task ${taskId}`);
      return null;
    }

    // Update assignees if provided
    if (assigneeID) {
      await updateTaskAssignees(taskId, assigneeID);
    }

    revalidatePath("/");
    return updatedTask;
  } catch (error: any) {
    console.error("Error updating task:", error);
    throw new Error(`Failed to update task: ${error.message}`);
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
