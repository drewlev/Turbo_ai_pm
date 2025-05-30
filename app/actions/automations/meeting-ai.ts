"use server";
import db from "@/app/db";
import { meetings } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { meetingNotesToTasks } from "@/app/actions/ai";
import { createTaskAndAssign } from "../tasks";

export type MeetingWithDetails = Awaited<
  ReturnType<typeof getMeetingWithDetails>
>;

export async function processMeetingToTasks(meetingId: number) {
  try {
    const meeting = await getMeetingWithDetails(meetingId);
    if (!meeting) {
      throw new Error("Meeting not found");
    }

    const projectUsers =
      meeting.project?.userProjects.map((userProject) => userProject.user) ||
      [];

    if (!meeting.sentences?.length) {
      throw new Error("No meeting sentences found");
    }

    const formattedNotes = formatMeetingTranscript(meeting.sentences);
    const tasks = await meetingNotesToTasks(formattedNotes);

    if (!tasks.data?.tasks?.length) {
      throw new Error("No tasks generated from meeting notes");
    }

    const combinedTaskDescription = tasks.data.tasks
      .map((task: any) => task.description)
      .join("\n\n");

    const taskResult = await createTaskAndAssign({
      title: `Meeting Tasks - ${meeting.title}`,
      description: combinedTaskDescription,
      projectId: meeting.projectId,
      assigneeID: projectUsers.map((user) => user.id),
      meetingId: meetingId,
    });

    if (!taskResult.success) {
      throw new Error(taskResult.error || "Failed to create task from meeting");
    }

    return {
      success: true,
      meeting,
      task: taskResult.task,
      message: "Meeting processed successfully",
    };
  } catch (error) {
    console.error("Error processing meeting to tasks:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Helper functions
async function getMeetingWithDetails(meetingId: number) {
  try {
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
  } catch (error) {
    console.error("Error fetching meeting details:", error);
    throw new Error("Failed to fetch meeting details");
  }
}

function formatMeetingTranscript(sentences: any[]): string {
  return sentences
    .map((note) => {
      return `${note.speakerName} (${note.startTime}-${note.endTime}): ${note.text}`;
    })
    .join("\n");
}
