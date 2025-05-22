"use server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

type AIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function generateAIResponse<T>({
  systemPrompt,
  userPrompt,
}: {
  systemPrompt: string;
  userPrompt: string;
}): Promise<AIResponse<T>> {
  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const messageContent = completion.choices[0].message?.content;

    if (messageContent) {
      try {
        const parsedResponse = JSON.parse(messageContent);
        return {
          success: true,
          data: parsedResponse as T,
        };
      } catch (jsonError) {
        console.error("Failed to parse JSON response from AI:", jsonError);
        return {
          success: false,
          error: "AI response was not valid JSON",
        };
      }
    }

    return {
      success: false,
      error: "No content received from AI",
    };
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

//MEETING NOTES to tasks
export async function meetingNotesToTasks(meetingNotes: string) {
  const systemPrompt = `You are an AI assistant specialized in extracting tasks for a UX designer from meeting transcripts. Your entire response MUST be a JSON object containing a single key: 'tasks'. The value of 'tasks' must be a JSON array of objects. Each object in the array should have two keys: 'description' (string) for the task description, and 'priority' (string, e.g., 'high', 'medium', 'low').`;

  const response = await generateAIResponse<{
    tasks: Array<{ description: string; priority: string }>;
  }>({
    systemPrompt,
    userPrompt: `Here are the meeting notes:\n\n${meetingNotes}\n\nPlease provide a list of tasks for our UX designer based on these notes.`,
  });

  return response;
}
