// lib/fireflies.ts
"use server";
import db from "@/app/db/index";
import { meetings, participants, sentences, speakers } from "@/app/db/schema";
import { eq } from "drizzle-orm";

type TranscriptType = {
  id: string;
  title: string;
  dateString: string;
  meeting_link: string | null;
  transcript_url: string;
};

type TranscriptsData = {
  transcripts: TranscriptType[];
};

type FirefliesMeetingListResponse = {
  error: any;
  data: TranscriptsData;
};

type ErrorDetail = {
  friendly: boolean;
  message: string;
  locations: {
    line: number;
    column: number;
  }[];
  path: string[];
  code: string;
  extensions: {
    code: string;
    status: number;
    metadata: Record<string, string>;
    correlationId: string;
  };
};

type Sentence = {
  index: number;
  text: string;
  start_time: number;
  end_time: number;
  speaker_name: string;
};

type Speaker = {
  id: number;
  name: string;
};

type TranscriptData = {
  id: string;
  title: string;
  dateString: string;
  duration: number;
  transcript_url: string;
  audio_url: string | null;
  video_url: string | null;
  sentences: Sentence[];
  speakers: Speaker[];
  participants: string[];
  meeting_link: string | null;
  analytics: any | null; // Assuming analytics can be any JSON object or null
};

type TranscriptResponse = {
  errors?: ErrorDetail[];
  data?: {
    transcript?: TranscriptData | null;
  };
};

// TODO: Move to .env
const apiKey = "cbf9223d-454c-4e6f-8fa7-37a053dcf65c";


async function fetchFirefliesTranscript(
  transcriptId: string
): Promise<TranscriptResponse> {
  // ... (Your existing fetchFirefliesTranscript function - it looks good!)
  const apiUrl = "https://api.fireflies.ai/graphql";
  const query = `
      query GetTranscript($transcriptId: String!) {
        transcript(id: $transcriptId) {
          id
          title
          dateString
          duration
          transcript_url
          audio_url
          video_url
          sentences {
            index
            text
            start_time
            end_time
            speaker_name
          }
          speakers {
            id
            name
          }
          participants
          meeting_link
          analytics {
            sentiments {
              positive_pct
              negative_pct
              neutral_pct
            }
            categories {
              questions
              tasks
              metrics
            }
          }
        }
      }
    `;
  const variables = { transcriptId };
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Fireflies API Error:", errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching transcript:", error);
    throw error;
  }
}


//how do i add a projectId to the meeting?
export async function createMeeting(meetingData: typeof meetings.$inferInsert) {
  const [createdMeeting] = await db
    .insert(meetings)
    .values(meetingData)
    .returning();
  return createdMeeting;
}

export async function createOrUpdateSpeakers(
  meetingId: number,
  firefliesSpeakers: { id: number; name: string }[]
) {
  // Map Fireflies speakers to your database schema, including the meetingId
  const newSpeakers = firefliesSpeakers.map((speaker) => ({
    meetingId: meetingId,
    firefliesSpeakerId: speaker.id,
    name: speaker.name,
  }));

  // Insert new speakers, and if a conflict occurs on (meetingId, firefliesSpeakerId), do nothing
  await db
    .insert(speakers)
    .values(newSpeakers)
    .onConflictDoNothing({
      target: [speakers.meetingId, speakers.firefliesSpeakerId],
    });

  // Fetch all speakers associated with the meeting to ensure we have their IDs
  return db.select().from(speakers).where(eq(speakers.meetingId, meetingId));
}

export async function createSentences(
  meetingId: number,
  firefliesSentences: Sentence[]
) {
  const newSentences = firefliesSentences.map((sentence) => ({
    meetingId: meetingId,
    index: sentence.index,
    text: sentence.text,
    startTime: sentence.start_time,
    endTime: sentence.end_time,
    speakerName: sentence.speaker_name,
  }));
  await db.insert(sentences).values(newSentences);
}

export async function createParticipants(
  meetingId: number,
  participantEmails: string[]
) {
  const newParticipants = participantEmails.map((email) => ({
    meetingId: meetingId,
    email: email.trim(), // Trim whitespace to avoid issues
  }));

  // Insert new participants, ignoring duplicates based on (meetingId, email)
  await db
    .insert(participants)
    .values(newParticipants)
    .onConflictDoNothing({
      target: [participants.meetingId, participants.email],
    });
}
export async function importFirefliesTranscript(
  transcriptId: string,
  projectId?: number
) {
  console.log(
    `Attempting to import Fireflies transcript with ID: ${transcriptId}`
  );
  if (projectId !== undefined) {
    console.log(`Associating with project ID: ${projectId}`);
  }

  try {
    console.log(
      `Fetching transcript data from Fireflies API for ID: ${transcriptId}`
    );
    const transcriptResponse = await fetchFirefliesTranscript(transcriptId);
    console.log(
      `Fireflies API response received for ID: ${transcriptId}`,
      transcriptResponse
    );

    if (transcriptResponse.errors && transcriptResponse.errors.length > 0) {
      console.error(
        `Fireflies API returned errors for transcript ID ${transcriptId}:`,
        transcriptResponse.errors
      );
      //   return null; // Or handle the error as needed
    }

    const transcriptData = transcriptResponse.data?.transcript;
    console.log(
      `Transcript data extracted for ID ${transcriptId}:`,
      transcriptData
    );

    if (!transcriptData) {
      console.warn(`No transcript data found for ID: ${transcriptId}`);
      return null;
    }

    console.log(`Creating Meeting record for transcript ID: ${transcriptId}`);
    // 1. Create the Meeting record
    const meeting = await createMeeting({
      title: transcriptData.title,
      dateString: new Date(transcriptData.dateString), // Ensure it's a Date object
      duration: transcriptData.duration,
      transcriptUrl: transcriptData.transcript_url,
      audioUrl: transcriptData.audio_url,
      videoUrl: transcriptData.video_url,
      meetingLink: transcriptData.meeting_link,
      projectId: projectId, // Optional: if you want to link it to a project immediately
      firefliesMeetingId: transcriptData.id,
      // You might want to add other relevant fields here in the future
    });

    if (meeting) {
      console.log(
        `Successfully created Meeting record with ID: ${meeting.id} for transcript ID: ${transcriptId}`
      );

      // 2. Create or Update Speakers
      if (transcriptData.speakers && transcriptData.speakers.length > 0) {
        console.log(
          `Creating or updating speakers for meeting ID: ${meeting.id}`
        );
        await createOrUpdateSpeakers(meeting.id, transcriptData.speakers);
        console.log(
          `Speakers created or updated for meeting ID: ${meeting.id}`
        );
      } else {
        console.log(`No speaker data found for transcript ID: ${transcriptId}`);
      }

      // 3. Create Sentences
      if (transcriptData.sentences && transcriptData.sentences.length > 0) {
        console.log(`Creating sentences for meeting ID: ${meeting.id}`);
        await createSentences(meeting.id, transcriptData.sentences);
        console.log(`Sentences created for meeting ID: ${meeting.id}`);
      } else {
        console.log(
          `No sentence data found for transcript ID: ${transcriptId}`
        );
      }

      // 4. Create Participants (handle potential comma-separated strings)
      if (
        transcriptData.participants &&
        transcriptData.participants.length > 0
      ) {
        console.log(`Processing participants for meeting ID: ${meeting.id}`);
        const allParticipants = transcriptData.participants
          .flatMap((p) => p.split(","))
          .map((p) => p.trim())
          .filter((p) => p);
        console.log(`Extracted participants:`, allParticipants);
        await createParticipants(meeting.id, allParticipants);
        console.log(`Participants created for meeting ID: ${meeting.id}`);
      } else {
        console.log(
          `No participant data found for transcript ID: ${transcriptId}`
        );
      }

      console.log(
        `Successfully imported transcript ${transcriptId} into meeting ID ${meeting.id}`
      );
      return meeting; // Return the created meeting object if needed
    } else {
      console.error(
        `Failed to create meeting for transcript ID: ${transcriptId}`
      );
      return null;
    }
  } catch (error) {
    console.error(
      `Error during Fireflies transcript import for ID ${transcriptId}:`,
      error
    );
    return null;
  }
}
