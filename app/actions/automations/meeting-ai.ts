"use server";
import db from "@/app/db";
import { meetings } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { meetingNotesToTasks } from "@/app/actions/ai";
import { createTaskAndAssign } from "../tasks";

export async function meetingToNotes(meetingId: number) {
  const meeting = await getMeetingWithDetails(meetingId);
  if (!meeting) {
    console.error("Meeting not found");
    return;
  }

  const projectUsers =
    meeting.project?.userProjects.map((userProject) => userProject.user) || [];

  if (meeting.sentences) {
    const formattedNotes = formatMeetingNotes(meeting.sentences);
    const tasks = await meetingNotesToTasks(formattedNotes);

    // Combine all tasks into a single task
    const combinedTaskDescription = tasks.tasks
      .map((task: any) => task.description)
      .join("\n\n");

    // Create a single task with all the data
    await createTaskAndAssign({
      title: `Meeting Tasks - ${meeting.title}`,
      description: combinedTaskDescription,
      projectId: meeting.projectId,
      assigneeID: projectUsers.map((user) => user.id),

    });
  }

  if (meeting.importTranscripts) {
    console.log(meeting.importTranscripts);
  }

  return meeting;
}

// Helper functions to make the code more modular
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

function formatMeetingNotes(sentences: any[]) {
  return sentences
    .map((note) => {
      return `${note.speakerName} (${note.startTime}-${note.endTime}): ${note.text}`;
    })
    .join("\n");
}
