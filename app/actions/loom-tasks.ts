// app/actions/loom-tasks.ts (or wherever this function lives)
"use server";

import db from "@/app/db";
import { tasks, looms, userProjects, users } from "@/app/db/schema";
import { eq, and, isNull, not } from "drizzle-orm"; // Import 'not'

export type TaskWithAssigneeInfo = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  assignee: {
    id: number;
    name: string | null;
    slackUser: {
      slackUserId: string;
      slackTeamId: string;
    } | null;
  } | null;
};

export async function getTasksMissingLoomsForProject(
  projectId: number
): Promise<TaskWithAssigneeInfo[]> {
  try {
    const tasksData = await db.query.tasks.findMany({
      where: and(
        eq(tasks.projectId, projectId),
        // --- CHANGE IS HERE ---
        // Filter out tasks that are 'completed' or 'done'.
        // Adjust these status values based on your actual task lifecycle.
        not(eq(tasks.status, "completed")),
        not(eq(tasks.status, "done"))
        // You might also want to exclude 'archived' tasks if that's a status
        // and(not(eq(tasks.status, "completed")), not(eq(tasks.status, "archived")))
        // --- END CHANGE ---
      ),
      with: {
        taskAssignees: {
          with: {
            user: {
              with: {
                slackUser: true,
              },
            },
          },
        },
        looms: true,
      },
    });

    // This filter is correct: it checks if the 'looms' relation is empty or null
    const tasksNeedingLooms = tasksData.filter(
      (task) => !task.looms || task.looms.length === 0
    );

    // Transform the data to include only the necessary information
    return tasksNeedingLooms.map((task) => {
      const assignee = task.taskAssignees[0]?.user; // Assuming single assignee for now
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignee: assignee
          ? {
              id: assignee.id,
              name: assignee.name,
              slackUser: assignee.slackUser
                ? {
                    slackUserId: assignee.slackUser.slackUserId,
                    slackTeamId: assignee.slackUser.slackTeamId,
                  }
                : null,
            }
          : null,
      };
    });
  } catch (error) {
    console.error(
      `Error fetching tasks missing looms for project ${projectId}:`,
      error
    );
    throw new Error("Failed to fetch tasks missing looms");
  }
}
