"use client";
import { importFirefliesTranscript } from "@/lib/fireflies";
import { Button } from "@/components/ui/button";
import { publishQStashMessage } from "@/app/actions/schdule-reminder";
import { createSlackOAuthUrl, sendMessageToSlack } from "@/app/actions/slack";
import { SignInButton } from "@clerk/nextjs";
import { UserProfile } from "@clerk/nextjs";
import { redirect } from "next/navigation";
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

      >
        Find Slack User
      </Button>
      <UserProfile/>  
    </div>
  );
}
