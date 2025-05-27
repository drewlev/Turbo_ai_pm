"use server";
import db from "@/app/db";
import { meetings } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { meetingNotesToTasks } from "@/app/actions/ai";
import { createTaskAndAssign } from "../tasks";

export async function processMeetingToTasks(meetingId: number) {
  const meeting = await getMeetingWithDetails(meetingId);
  if (!meeting) {
    throw new Error("Meeting not found");
  }

  const projectUsers =
    meeting.project?.userProjects.map((userProject) => userProject.user) || [];

  if (!meeting.sentences?.length) {
    throw new Error("No meeting sentences found");
  }

  const formattedNotes = formatMeetingTranscript(meeting.sentences);
  const tasks = await meetingNotesToTasks(formattedNotes);

  // Combine all tasks into a single task
  const combinedTaskDescription = tasks.data?.tasks
    .map((task: any) => task.description)
    .join("\n\n");

  // Create a single task with all the data
  console.log({ meetingId });
  const task = await createTaskAndAssign({
    title: `Meeting Tasks - ${meeting.title}`,
    description: combinedTaskDescription,
    projectId: meeting.projectId,
    assigneeID: projectUsers.map((user) => user.id),
    meetingId: meetingId,
  });
  console.log({ task });
  return meeting;
}

// Helper functions
async function getMeetingWithDetails(meetingId: number) {
  return await db.query.meetings.findFirst({
    where: eq(meetings.id, meetingId),
    with: {
      sentences: true,
      importTranscripts: true,
      project: {
        with: {
          userProjects: {
            with: {
              user: true,
            },
          },
        },
      },
    },
  });
}

function formatMeetingTranscript(sentences: any[]) {
  return sentences
    .map((note) => {
      return `${note.speakerName} (${note.startTime}-${note.endTime}): ${note.text}`;
    })
    .join("\n");
}
