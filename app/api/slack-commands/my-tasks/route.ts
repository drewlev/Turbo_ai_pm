import { getTasksForSlackUser } from "@/app/actions/slack-commands/slack-task-commands";
import { NextRequest, NextResponse } from "next/server";

interface SlackCommandPayload {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  api_app_id: string;
  is_enterprise_install: string;
  response_url: string;
  trigger_id: string;
}

interface UserTask {
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  taskId: number;
  task: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
    status: string;
    projectId: number | null;
    title: string;
    meetingId: number | null;
    priority: string;
    dueDate: Date | null;
  };
}

export async function POST(request: NextRequest) {
  try {
    const rawFormData = await request.formData();
    const slackData: SlackCommandPayload = {
      token: rawFormData.get("token") as string,
      team_id: rawFormData.get("team_id") as string,
      team_domain: rawFormData.get("team_domain") as string,
      channel_id: rawFormData.get("channel_id") as string,
      channel_name: rawFormData.get("channel_name") as string,
      user_id: rawFormData.get("user_id") as string,
      user_name: rawFormData.get("user_name") as string,
      command: rawFormData.get("command") as string,
      text: rawFormData.get("text") as string,
      api_app_id: rawFormData.get("api_app_id") as string,
      is_enterprise_install: rawFormData.get("is_enterprise_install") as string,
      response_url: rawFormData.get("response_url") as string,
      trigger_id: rawFormData.get("trigger_id") as string,
    };

    const userId = slackData.user_id;

    if (!userId) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    const tasks: UserTask[] | undefined = await getTasksForSlackUser(
      slackData.user_id
    );

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "You have no tasks assigned to you.",
      });
    }

    // --- Format tasks as a bulleted list ---
    let listContent = "Here are your tasks:\n\n";

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    tasks.forEach((userTask) => {
      const task = userTask.task;
      const status = task.status || "N/A";
      const title = task.title || "N/A";
      const priority = task.priority || "N/A";
      const dueDate = task.dueDate
        ? new Date(task.dueDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "N/A";

      listContent += `• *${title}*\n`;
      listContent += `  ⁃ Status: ${status}\n`;
      listContent += `  ⁃ Priority: ${priority}\n`;
      listContent += `  ⁃ Due Date: ${dueDate}\n`;
      listContent += `  ⁃ View Task: ${baseUrl}/app/task/${task.id}\n`;
    });

    console.log("List Content:", listContent);

    // Return the formatted message using Block Kit for reliable Markdown rendering
    return NextResponse.json({
      response_type: "in_channel",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn", // Ensures Markdown is parsed
            text: listContent,
          },
        },
      ],
    });
  } catch (error) {
    console.error("Error processing Slack command:", error);
    return NextResponse.json(
      { error: "Failed to process command" },
      { status: 500 }
    );
  }
}
