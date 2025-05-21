// lib/fireflies.ts
"use server";
import { getFirefliesApiKey } from "@/app/actions/fireflies";
import db from "@/app/db/index";
import { meetings, participants, sentences, speakers } from "@/app/db/schema";
import { eq } from "drizzle-orm";

// Types
export interface FirefliesTranscript {
  id: string;
  title: string;
  dateString: string;
  duration: number;
  transcript_url: string;
  audio_url: string | null;
  video_url: string | null;
  sentences: FirefliesSentence[];
  speakers: FirefliesSpeaker[];
  participants: string[];
  meeting_link: string | null;
  analytics: FirefliesAnalytics | null;
}

export interface FirefliesSentence {
  index: number;
  text: string;
  start_time: number;
  end_time: number;
  speaker_name: string;
}

export interface FirefliesSpeaker {
  id: number;
  name: string;
}

export interface FirefliesAnalytics {
  sentiments?: {
    positive_pct: number;
    negative_pct: number;
    neutral_pct: number;
  };
  categories?: {
    questions: string[];
    tasks: string[];
    metrics: string[];
  };
}

export interface FirefliesError {
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
}

export interface FirefliesResponse {
  errors?: FirefliesError[];
  data?: {
    transcript?: FirefliesTranscript | null;
  };
}

// Constants
const FIREFLIES_API_URL = "https://api.fireflies.ai/graphql";

// GraphQL Query
const GET_TRANSCRIPT_QUERY = `
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

// API Functions
export async function fetchFirefliesTranscript(
  transcriptId: string,
  userId: number
): Promise<FirefliesResponse> {
  const firefliesApiKey = await getFirefliesApiKey(userId);

  try {
    const response = await fetch(FIREFLIES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firefliesApiKey}`,
      },
      body: JSON.stringify({
        query: GET_TRANSCRIPT_QUERY,
        variables: { transcriptId },
      }),
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

// Database Functions
export async function createMeeting(meetingData: typeof meetings.$inferInsert) {
  try {
    const [createdMeeting] = await db
      .insert(meetings)
      .values(meetingData)
      .returning();
    return createdMeeting;
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }
}

export async function createOrUpdateSpeakers(
  meetingId: number,
  firefliesSpeakers: FirefliesSpeaker[]
) {
  try {
    const newSpeakers = firefliesSpeakers.map((speaker) => ({
      meetingId,
      firefliesSpeakerId: speaker.id,
      name: speaker.name,
    }));

    await db
      .insert(speakers)
      .values(newSpeakers)
      .onConflictDoNothing({
        target: [speakers.meetingId, speakers.firefliesSpeakerId],
      });

    return db.select().from(speakers).where(eq(speakers.meetingId, meetingId));
  } catch (error) {
    console.error("Error creating/updating speakers:", error);
    throw error;
  }
}

export async function createSentences(
  meetingId: number,
  firefliesSentences: FirefliesSentence[]
) {
  try {
    const newSentences = firefliesSentences.map((sentence) => ({
      meetingId,
      index: sentence.index,
      text: sentence.text,
      startTime: sentence.start_time.toString(),
      endTime: sentence.end_time.toString(),
      speakerName: sentence.speaker_name,
    }));

    await db.insert(sentences).values(newSentences);
  } catch (error) {
    console.error("Error creating sentences:", error);
    throw error;
  }
}

export async function createParticipants(
  meetingId: number,
  participantEmails: string[]
) {
  try {
    const newParticipants = participantEmails
      .map((email) => email.trim())
      .filter((email) => email)
      .map((email) => ({
        meetingId,
        email,
      }));

    await db
      .insert(participants)
      .values(newParticipants)
      .onConflictDoNothing({
        target: [participants.meetingId, participants.email],
      });
  } catch (error) {
    console.error("Error creating participants:", error);
    throw error;
  }
}

export async function findprojectByClientEmail(clientEmail: string) {
  try {
    const client = await db.query.clients.findFirst({
      where: (clients, { eq }) => eq(clients.email, clientEmail.toLowerCase()),
      with: {
        project: true,
      },
    });

    return client?.project?.id;
  } catch (error) {
    console.error("Error finding project by client email:", error);
    throw error;
  }
}

// Main Import Function
export async function importFirefliesTranscript(
  transcriptId: string,
  userId: number,
  projectId?: number
) {
  console.log(`Importing Fireflies transcript: ${transcriptId}`);

  try {
    const transcriptResponse = await fetchFirefliesTranscript(
      transcriptId,
      userId
    );

    if (transcriptResponse.errors?.length) {
      console.log(
        `Fireflies API errors: ${JSON.stringify(transcriptResponse.errors)}`
      );
    }

    const transcriptData = transcriptResponse.data?.transcript;
    if (!transcriptData) {
      throw new Error(`No transcript data found for ID: ${transcriptId}`);
    }

    // Always check participant emails for project ID, even if one was provided
    let foundProjectId = projectId;
    if (transcriptData.participants?.length) {
      const participantEmails = transcriptData.participants
        .flatMap((p) => p.split(","))
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email);

      // Try to find a project ID from any of the participant emails
      for (const email of participantEmails) {
        const clientProjectId = await findprojectByClientEmail(email);
        if (clientProjectId) {
          // If we already have a projectId from the parameter, log the conflict
          if (foundProjectId && foundProjectId !== clientProjectId) {
            console.log(
              `Found conflicting project IDs: provided=${foundProjectId}, client=${clientProjectId} for email ${email}. Using provided ID.`
            );
          } else if (!foundProjectId) {
            // Only use the found project ID if we don't have one from the parameter
            foundProjectId = clientProjectId;
            console.log(
              `Found project ID ${foundProjectId} for client email ${email}`
            );
          }
          break;
        }
      }
    }

    // Create meeting record
    const meeting = await createMeeting({
      title: transcriptData.title,
      dateString: new Date(transcriptData.dateString),
      duration: transcriptData.duration.toString(),
      transcriptUrl: transcriptData.transcript_url,
      audioUrl: transcriptData.audio_url,
      videoUrl: transcriptData.video_url,
      meetingLink: transcriptData.meeting_link,
      projectId: foundProjectId,
      firefliesMeetingId: transcriptData.id,
    });

    if (!meeting) {
      throw new Error(
        `Failed to create meeting for transcript: ${transcriptId}`
      );
    }

    // Process related data
    await Promise.all(
      [
        transcriptData.speakers?.length &&
          createOrUpdateSpeakers(meeting.id, transcriptData.speakers),
        transcriptData.sentences?.length &&
          createSentences(meeting.id, transcriptData.sentences),
        transcriptData.participants?.length &&
          createParticipants(
            meeting.id,
            transcriptData.participants.flatMap((p) => p.split(","))
          ),
      ].filter(Boolean)
    );

    return meeting;
  } catch (error) {
    console.error(`Error importing transcript ${transcriptId}:`, error);
    throw error;
  }
}
