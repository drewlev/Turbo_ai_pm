"use server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

//MEETING NOTES to tasks
export async function meetingNotesToTasks(meetingNotes: string) {
  // Changed type to any[] for clarity
  console.log("hi");

  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o", // Ensure this model is supported and appropriate on OpenRouter
      messages: [
        {
          // Use the system role for general instructions and desired output format
          role: "system",
          content:
            "You are an AI assistant specialized in extracting tasks for a UX designer from meeting transcripts. Your entire response MUST be a JSON object containing a single key: 'tasks'. The value of 'tasks' must be a JSON array of objects. Each object in the array should have two keys: 'description' (string) for the task description, and 'priority' (string, e.g., 'high', 'medium', 'low').",
        },
        {
          // The user role provides the specific input for this turn
          role: "user",
          content: `Here are the meeting notes:\n\n${meetingNotes}\n\nPlease provide a list of tasks for our UX designer based on these notes.`,
        },
      ],
      response_format: { type: "json_object" }, // Enforces JSON output
    });

    const messageContent = completion.choices[0].message?.content;

    if (messageContent) {
      try {
        const parsedResponse = JSON.parse(messageContent);
        console.log("Parsed AI Response:", parsedResponse);
        // You might want to return parsedResponse.tasks if that's the structure you expect
        return parsedResponse; // Returning the whole parsed object for now
      } catch (jsonError) {
        console.error("Failed to parse JSON response from AI:", jsonError);
        console.error("Raw AI response content:", messageContent);
        // Return null or throw a specific error if JSON parsing fails
        throw new Error("AI response was not valid JSON.");
      }
    } else {
      console.log("No content received from AI.");
      return null;
    }
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    // Re-throw or handle the error appropriately
    throw error;
  }
}
