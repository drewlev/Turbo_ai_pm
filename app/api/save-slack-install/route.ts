import { saveSlackInstall } from "@/app/actions/slack";
import { NextRequest, NextResponse } from "next/server";
import { SlackApiResponse, SlackInstall } from "@/app/types/slack";

export async function POST(request: NextRequest) {
  try {
    const requestBody = (await request.json()) as SlackInstall;

    if (!isValidSlackInstall(requestBody)) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const slackInstall = await saveSlackInstall(requestBody);

    const response: SlackApiResponse<typeof slackInstall> = {
      success: true,
      data: slackInstall,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error processing Slack installation:", error);

    const response: SlackApiResponse<null> = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process request",
    };

    return NextResponse.json(response, { status: 400 });
  }
}

function isValidSlackInstall(install: any): install is SlackInstall {
  return (
    typeof install === "object" &&
    typeof install.teamId === "string" &&
    typeof install.teamName === "string" &&
    typeof install.botToken === "string" &&
    typeof install.installerUserId === "string"
  );
}
