"use client";
import { importFirefliesTranscript } from "@/lib/fireflies";
import { Button } from "@/components/ui/button";
import { createSlackOAuthUrl, sendMessageToSlack } from "@/app/actions/slack";
import { redirect } from "next/navigation";
import { stopWatchingCalendar } from "@/app/actions/google-calendar";
import { publishQStashCron } from "@/app/actions/schdule-reminder";

export default function InternalPage() {
  return (
    <div>
      Internal Page
      <Button
        onClick={async () => {
          const transcript = await importFirefliesTranscript(
            "01JTZVXWRGJVN5BZCD9FG06FVR",
            12
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
          await sendMessageToSlack("Hello, world!", 17);
        }}
      >
        Send Message to Slack
      </Button>
      <Button
        onClick={async () => {
          await stopWatchingCalendar(
            "2dac05a3-3d01-414a-87c4-a12bb1c51132",
            "rUdMRR7OsWosSimA50Whpnvq1Lw"
          );
        }}
      >
        stopWatchingCalendar
      </Button>
      <Button
        onClick={async () => {
          await publishQStashCron(
            "0 0 * * 0",
            {
              eventId: "calendar-watch-renewal",
              watchId: 1,
              channelId: "test",
              resourceId: "test",
              userId: 1,
            },
            "/test"
          );
        }}
      >
        scheduleCalendarWatchRenewal
      </Button>
    </div>
  );
}
