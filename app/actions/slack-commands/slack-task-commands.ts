import { getUserIdBySlackUserId } from "../slack";
import { getTasksByUserId } from "../tasks";

export async function getTasksForSlackUser(slackUserId: string) {
  const userId = await getUserIdBySlackUserId(slackUserId);
  if (!userId) {
    throw new Error("User not found");
  }
  const tasks = await getTasksByUserId(userId);
  return tasks;
  
}