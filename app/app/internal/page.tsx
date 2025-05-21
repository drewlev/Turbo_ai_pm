"use client";
import { importFirefliesTranscript } from "@/lib/fireflies";
import { Button } from "@/components/ui/button";
import { createSlackOAuthUrl, sendMessageToSlack } from "@/app/actions/slack";
import { redirect } from "next/navigation";
import { meetingToNotes } from "@/app/actions/automations/meeting-ai";

export default function InternalPage() {
  return (
    <div>
      Internal Page
      <Button
        onClick={async () => {
          const transcript = await importFirefliesTranscript(
            "01JTZVXWRGJVN5BZCD9FG06FVR"
          );
          console.log(transcript);
        }}
      >
        Fetch Transcript
      </Button>
      <Button
        onClick={async () => {
          const url = await createSlackOAuthUrl();
          redirect(url);
        }}
      >
        Create Slack OAuth URL
      </Button>
      <Button
        onClick={async () => {
          await sendMessageToSlack("Hello, world!", 12);
        }}
      >
        Send Message to Slack
      </Button>
      <Button
        onClick={async () => {
          await meetingToNotes(2);
        }}
      >
        test{" "}
      </Button>
    </div>
  );
}
