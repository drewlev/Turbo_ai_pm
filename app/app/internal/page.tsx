"use client";
import { importFirefliesTranscript } from "@/lib/fireflies";
import { Button } from "@/components/ui/button";
import { publishQStashMessage } from "@/app/actions/schdule-reminder";

export default function InternalPage() {


  return (
    <div>
      Internal Page
      <Button onClick={async () => {
        const transcript = await importFirefliesTranscript("01JTZVXWRGJVN5BZCD9FG06FVR");
        console.log(transcript);
      }}>Fetch Transcript</Button>
      <Button onClick={async () => {
        await publishQStashMessage();
      }}>Publish QStash Message</Button>
    </div>
  );
}
