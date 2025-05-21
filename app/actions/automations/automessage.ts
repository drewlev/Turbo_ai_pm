"use server";
import db from "@/app/db";
import { slackUsers, calendarEvents, clients, projects } from "@/app/db/schema";
import { eq } from "drizzle-orm";

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

export async function IdenifyProjectByEvent(gCalEventId: string) {
  const gCalEvent = await db.query.calendarEvents.findFirst({
    where: eq(calendarEvents.id, gCalEventId),
  });

  if (!gCalEvent) {
    throw new Error("Event not found");
  }

  const MembersOnTheCall = gCalEvent.attendees as Attendees;

  for (const member of MembersOnTheCall) {
    const client = await db.query.clients.findFirst({
      where: eq(clients.email, member.email),
    });

    if (client) {
      console.log(client);
    }
  }
}

// export async function sendMessageToDesigner(projectId: string) {
//   const project = await db.query.projects.findFirst({
//     where: eq(projects.id, projectId),
//   });

//   if (!project) {
//     throw new Error("Project not found");
//   }
// }