"use server";
import db from "@/app/db";
import { slackUsers, calendarEvents, clients, projects } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { sendMessageToSlack } from "../slack";
import type { clients as ClientType } from "@/app/db/schema";

export async function getSlackUsers() {
  const slackUsers = await db.query.slackUsers.findMany();
}

type Attendee = {
  email: string;
  responseStatus: "accepted" | "needsAction" | "declined" | "tentative"; // Added other common response statuses
  self?: boolean; // Optional, as it's not always present
  organizer?: boolean; // Optional, as it's not always present
};

type Attendees = Attendee[];

export async function identifyProjectByEvent(
  gCalEventId: string
): Promise<number | null> {
  console.log(
    `[identifyProjectByEvent] Starting project identification for event: ${gCalEventId}`
  );

  try {
    const gCalEvent = await db.query.calendarEvents.findFirst({
      where: eq(calendarEvents.id, gCalEventId),
    });

    if (!gCalEvent) {
      console.error(
        `[identifyProjectByEvent] Event not found for ID: ${gCalEventId}`
      );
      return null;
    }

    console.log(
      `[identifyProjectByEvent] Found event: ${
        gCalEvent.summary || "No summary"
      }`
    );

    const membersOnTheCall = gCalEvent.attendees as Attendees;
    if (!membersOnTheCall?.length) {
      console.error(
        `[identifyProjectByEvent] No attendees found for event: ${gCalEventId}`
      );
      return null;
    }

    console.log(
      `[identifyProjectByEvent] Processing ${membersOnTheCall.length} attendees`
    );

    for (const member of membersOnTheCall) {
      console.log(
        `[identifyProjectByEvent] Checking attendee: ${member.email}`
      );

      const client = await db.query.clients.findFirst({
        where: eq(clients.email, member.email),
        with: {
          project: true,
        },
      });

      if (client?.project?.id) {
        console.log(
          `[identifyProjectByEvent] Found matching client: ${client.name} for project: ${client.project.id}`
        );
        await sendMessageToDesignerInProject(client.project.id, client);
        return client.project.id;
      } else {
        console.log(
          `[identifyProjectByEvent] No matching client found for email: ${member.email}`
        );
      }
    }

    console.error(
      `[identifyProjectByEvent] No matching client found for event: ${gCalEventId}`
    );
    return null;
  } catch (error) {
    console.error(
      `[identifyProjectByEvent] Error identifying project for event ${gCalEventId}:`,
      error
    );
    return null;
  }
}

export async function sendMessageToDesignerInProject(
  projectId: number,
  client: typeof ClientType.$inferSelect
): Promise<void> {
  console.log(
    `[sendMessageToDesignerInProject] Starting message sending for project: ${projectId}, client: ${client.name}`
  );

  try {
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
      console.error(
        `[sendMessageToDesignerInProject] Project not found for ID: ${projectId}`
      );
      throw new Error(`Project not found for ID: ${projectId}`);
    }

    console.log(
      `[sendMessageToDesignerInProject] Found project: ${project.name}`
    );

    if (!project.userProjects?.length) {
      console.warn(
        `[sendMessageToDesignerInProject] No users found in project: ${projectId}`
      );
      return;
    }

    console.log(
      `[sendMessageToDesignerInProject] Found ${project.userProjects.length} users in project`
    );

    const message = `Tomorrow you have a call with ${client.name}. Please create a Loom to prepare for the call.`;
    console.log(
      `[sendMessageToDesignerInProject] Prepared message: "${message}"`
    );

    let successCount = 0;
    let failureCount = 0;

    for (const userProject of project.userProjects) {
      const { user } = userProject;
      console.log(
        `[sendMessageToDesignerInProject] Processing user: ${user.name} (ID: ${user.id})`
      );

      if (!user.slackUser?.id) {
        console.log(
          `[sendMessageToDesignerInProject] User ${user.id} does not have a connected Slack account. Skipping message.`
        );
        continue;
      }

      try {
        console.log(
          `[sendMessageToDesignerInProject] Sending Slack message to user: ${user.name}`
        );
        await sendMessageToSlack(message, user.slackUser.userId);
        console.log(
          `[sendMessageToDesignerInProject] Successfully sent message to user: ${user.name}`
        );
        successCount++;
      } catch (error) {
        console.error(
          `[sendMessageToDesignerInProject] Failed to send Slack message to user ${user.id}:`,
          error
        );
        failureCount++;
      }
    }

    console.log(
      `[sendMessageToDesignerInProject] Message sending complete. Success: ${successCount}, Failures: ${failureCount}`
    );
  } catch (error) {
    console.error(
      `[sendMessageToDesignerInProject] Error sending messages for project ${projectId}:`,
      error
    );
    throw error;
  }
}
