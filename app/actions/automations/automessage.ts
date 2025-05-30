"use server";
import db from "@/app/db";
import { calendarEvents, clients, projects } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { sendMessageToSlack } from "../slack";
import type { clients as ClientType } from "@/app/db/schema";
import { getTasksMissingLoomsForProject } from "../loom-tasks";

// Types
type Attendee = {
  email: string;
  responseStatus: "accepted" | "needsAction" | "declined" | "tentative";
  self?: boolean;
  organizer?: boolean;
};

type CalendarEvent = {
  id: string;
  summary: string | null;
  attendees: Attendee[] | null;
  [key: string]: any; // Allow other properties
};

type ProjectWithUsers = {
  id: number;
  name: string;
  userProjects: Array<{
    userId: number;
    projectId: number;
    user: {
      id: number;
      name: string | null;
      slackUser: {
        id: number;
        userId: number;
        slackUserId: string;
        slackTeamId: string;
        slackTeamName: string;
        slackAccessToken: string;
      } | null;
    };
  }>;
};

// Error classes
class CalendarEventNotFoundError extends Error {
  constructor(eventId: string) {
    super(`Calendar event not found: ${eventId}`);
    this.name = "CalendarEventNotFoundError";
  }
}

class NoAttendeesError extends Error {
  constructor(eventId: string) {
    super(`No attendees found for event: ${eventId}`);
    this.name = "NoAttendeesError";
  }
}

class NoMatchingClientError extends Error {
  constructor(eventId: string) {
    super(`No matching client found for event: ${eventId}`);
    this.name = "NoMatchingClientError";
  }
}

// Core functions
async function findCalendarEvent(eventId: string): Promise<CalendarEvent> {
  const event = await db.query.calendarEvents.findFirst({
    where: eq(calendarEvents.id, eventId),
  });

  if (!event) {
    throw new CalendarEventNotFoundError(eventId);
  }

  return event as CalendarEvent;
}

async function findClientByAttendeeEmail(email: string) {
  return await db.query.clients.findFirst({
    where: eq(clients.email, email),
    with: {
      project: true,
    },
  });
}

async function findProjectWithUsers(
  projectId: number
): Promise<ProjectWithUsers> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      userProjects: {
        with: {
          user: {
            with: {
              slackUser: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new Error(`Project not found for ID: ${projectId}`);
  }

  return project as ProjectWithUsers;
}

async function sendSlackNotification(
  userId: number,
  message: string
): Promise<void> {
  await sendMessageToSlack(message, userId);
}

// Main handler
export async function handleCalendarEventNotification(
  eventId: string
): Promise<number | null> {
  try {
    const event = await findCalendarEvent(eventId);
    const attendees = event.attendees;

    if (!attendees?.length) {
      throw new NoAttendeesError(eventId);
    }

    for (const attendee of attendees) {
      const client = await findClientByAttendeeEmail(attendee.email);

      if (client?.project?.id) {
        await notifyProjectTeam(client.project.id, client);
        return client.project.id;
      }
    }

    throw new NoMatchingClientError(eventId);
  } catch (error) {
    if (
      error instanceof CalendarEventNotFoundError ||
      error instanceof NoAttendeesError ||
      error instanceof NoMatchingClientError
    ) {
      console.error(`[Calendar Event Notification] ${error.message}`);
      return null;
    }
    throw error;
  }
}

// Notification handler
async function notifyProjectTeam(
  projectId: number,
  client: typeof ClientType.$inferSelect
): Promise<void> {
  try {
    const project = await findProjectWithUsers(projectId);
    const tasksMissingLooms = await getTasksMissingLoomsForProject(projectId);

    // Base message about the upcoming call
    const baseMessage = `Tomorrow you have a call with ${client.name}. Please create a Loom to prepare for the call.`;

    // Add information about tasks missing Loom videos
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    let tasksMessage = "";
    if (tasksMissingLooms.length > 0) {
      tasksMessage =
        "\n\nYou also have the following tasks that need Loom videos:\n";
      tasksMissingLooms.forEach((task) => {
        tasksMessage += `• ${task.title}\n`;
        tasksMessage += ` ⁃ View Task: ${baseUrl}/app/task/${task.id}\n`;
      });
    }

    const message = baseMessage + tasksMessage;

    const notificationPromises = project.userProjects
      .filter((userProject) => userProject.user.slackUser?.id)
      .map(async (userProject) => {
        try {
          await sendSlackNotification(
            userProject.user.slackUser!.userId,
            message
          );
          return { success: true, userId: userProject.user.id };
        } catch (error) {
          console.error(
            `Failed to send Slack message to user ${userProject.user.id}:`,
            error
          );
          return { success: false, userId: userProject.user.id };
        }
      });

    const results = await Promise.all(notificationPromises);
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    console.log(
      `[Project Team Notification] Complete. Success: ${successCount}, Failures: ${failureCount}`
    );
  } catch (error) {
    console.error(
      `[Project Team Notification] Error notifying team for project ${projectId}:`,
      error
    );
    throw error;
  }
}
