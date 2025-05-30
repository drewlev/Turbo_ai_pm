"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importFirefliesTranscript } from "@/lib/fireflies";
import { createSlackOAuthUrl, sendMessageToSlack } from "@/app/actions/slack";
import { redirect } from "next/navigation";
import { stopWatchingCalendar } from "@/app/actions/google-calendar";
import { publishQStashCron } from "@/app/actions/schdule-reminder";
import { toast } from "sonner";
import { getTasksMissingLoomsForProject } from "@/app/actions/loom-tasks";

// Assuming TaskWithAssigneeInfo is defined somewhere accessible,
// perhaps in a shared types file or directly in loom-tasks.ts
// For this component, we'll define a minimal type if not globally available.
type TaskWithAssigneeInfo = {
  id: number;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  dueDate: Date | null;
  assignee: {
    id: number;
    name: string | null;
    slackUser: {
      slackUserId: string;
      slackTeamId: string;
    } | null;
  } | null;
};

export default function InternalPage() {
  // State for Fireflies Transcript
  const [firefliesTranscriptId, setFirefliesTranscriptId] = useState(
    "01JTZVXWRGJVN5BZCD9FG06FVR"
  );
  const [firefliesUserId, setFirefliesUserId] = useState("12");

  // State for Slack Message
  const [slackMessage, setSlackMessage] = useState("Hello, world!");
  const [slackChannelId, setSlackChannelId] = useState("17");

  // State for Stop Watching Calendar
  const [calendarWatchId, setCalendarWatchId] = useState(
    "2dac05a3-3d01-414a-87c4-a12bb1c51132"
  );
  const [calendarResourceId, setCalendarResourceId] = useState(
    "rUdMRR7OsWosSimA50Whpnvq1Lw"
  );

  // State for QStash Cron
  const [cronExpression, setCronExpression] = useState("0 0 * * 0");
  const [qstashEventId, setQstashEventId] = useState("calendar-watch-renewal");
  const [qstashWatchId, setQstashWatchId] = useState("1");
  const [qstashChannelId, setQstashChannelId] = useState("test");
  const [qstashResourceId, setQstashResourceId] = useState("test");
  const [qstashUserId, setQstashUserId] = useState("1");
  const [qstashCallbackUrl, setQstashCallbackUrl] = useState("/test");

  // State for Loom Tasks
  const [loomTasksProjectId, setLoomTasksProjectId] = useState("1");
  const [tasksMissingLooms, setTasksMissingLooms] = useState<
    TaskWithAssigneeInfo[]
  >([]);

  const handleFirefliesFetch = async () => {
    try {
      const transcript = await importFirefliesTranscript(
        firefliesTranscriptId,
        parseInt(firefliesUserId)
      );
      console.log("Transcript:", transcript);
      toast.success("Transcript fetched successfully!");
    } catch (error) {
      console.error("Error fetching transcript:", error);
      toast.error("Failed to fetch transcript.");
    }
  };

  const handleSendMessageToSlack = async () => {
    try {
      await sendMessageToSlack(slackMessage, parseInt(slackChannelId));
      toast.success("Message sent to Slack!");
    } catch (error) {
      console.error("Error sending Slack message:", error);
      toast.error("Failed to send Slack message.");
    }
  };

  const handleStopWatchingCalendar = async () => {
    try {
      await stopWatchingCalendar(calendarWatchId, calendarResourceId);
      toast.success("Calendar watch stopped!");
    } catch (error) {
      console.error("Error stopping calendar watch:", error);
      toast.error("Failed to stop calendar watch.");
    }
  };

  const handleScheduleQStashCron = async () => {
    try {
      await publishQStashCron(
        cronExpression,
        {
          eventId: qstashEventId,
          watchId: parseInt(qstashWatchId),
          channelId: qstashChannelId,
          resourceId: qstashResourceId,
          userId: parseInt(qstashUserId),
        },
        qstashCallbackUrl
      );
      toast.success("QStash cron scheduled!");
    } catch (error) {
      console.error("Error scheduling QStash cron:", error);
      toast.error("Failed to schedule QStash cron.");
    }
  };

  const handleGetTasksMissingLooms = async () => {
    try {
      const projectId = parseInt(loomTasksProjectId);
      if (isNaN(projectId)) {
        toast.error("Please enter a valid Project ID (number).");
        return;
      }
      const tasks = await getTasksMissingLoomsForProject(projectId);
      setTasksMissingLooms(tasks);
      toast.success(`Found ${tasks.length} tasks missing Looms.`);
    } catch (error) {
      console.error("Error fetching tasks missing Looms:", error);
      toast.error("Failed to fetch tasks missing Looms.");
    }
  };

  return (
    <div className="p-6 space-y-8 bg-[var(--background)] text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-10">
        Internal Dev Tools
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Fireflies Transcript Section */}
        <div className="border border-gray-700 rounded-lg p-6 space-y-4 bg-gray-800">
          <h2 className="text-xl font-semibold text-turbo-blue">
            Fireflies Transcript
          </h2>
          <div>
            <Label
              htmlFor="firefliesTranscriptId"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Transcript ID
            </Label>
            <Input
              id="firefliesTranscriptId"
              type="text"
              value={firefliesTranscriptId}
              onChange={(e) => setFirefliesTranscriptId(e.target.value)}
              placeholder="e.g., 01JTZVXWRGJVN5BZCD9FG06FVR"
              className="w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            />
          </div>
          <div>
            <Label
              htmlFor="firefliesUserId"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              User ID
            </Label>
            <Input
              id="firefliesUserId"
              type="number"
              value={firefliesUserId}
              onChange={(e) => setFirefliesUserId(e.target.value)}
              placeholder="e.g., 12"
              className="w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            />
          </div>
          <Button
            onClick={handleFirefliesFetch}
            className="w-full bg-turbo-blue hover:bg-turbo-blue/90 text-white"
          >
            Fetch Transcript
          </Button>
        </div>
        {/* Slack Section */}
        <div className="border border-gray-700 rounded-lg p-6 space-y-4 bg-gray-800">
          <h2 className="text-xl font-semibold text-turbo-blue">
            Slack Actions
          </h2>
          <Button
            onClick={async () => {
              try {
                const url = await createSlackOAuthUrl();
                redirect(url);
              } catch (error) {
                console.error("Error creating Slack OAuth URL:", error);
                toast.error("Failed to create Slack OAuth URL.");
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Slack OAuth URL
          </Button>
          <div>
            <Label
              htmlFor="slackMessage"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Message
            </Label>
            <Input
              id="slackMessage"
              type="text"
              value={slackMessage}
              onChange={(e) => setSlackMessage(e.target.value)}
              placeholder="e.g., Hello, world!"
              className="w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            />
          </div>
          <div>
            <Label
              htmlFor="slackChannelId"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Channel ID (numeric)
            </Label>
            <Input
              id="slackChannelId"
              type="number"
              value={slackChannelId}
              onChange={(e) => setSlackChannelId(e.target.value)}
              placeholder="e.g., 17"
              className="w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            />
          </div>
          <Button
            onClick={handleSendMessageToSlack}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Send Message to Slack
          </Button>
        </div>
        {/* Google Calendar Section */}
        <div className="border border-gray-700 rounded-lg p-6 space-y-4 bg-gray-800">
          <h2 className="text-xl font-semibold text-turbo-blue">
            Google Calendar Actions
          </h2>
          <div>
            <Label
              htmlFor="calendarWatchId"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Watch ID
            </Label>
            <Input
              id="calendarWatchId"
              type="text"
              value={calendarWatchId}
              onChange={(e) => setCalendarWatchId(e.target.value)}
              placeholder="e.g., 2dac05a3-..."
              className="w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            />
          </div>
          <div>
            <Label
              htmlFor="calendarResourceId"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Resource ID
            </Label>
            <Input
              id="calendarResourceId"
              type="text"
              value={calendarResourceId}
              onChange={(e) => setCalendarResourceId(e.target.value)}
              placeholder="e.g., rUdMRR7OsWos..."
              className="w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            />
          </div>
          <Button
            onClick={handleStopWatchingCalendar}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Stop Watching Calendar
          </Button>
        </div>
        {/* QStash Cron Section */}
        <div className="border border-gray-700 rounded-lg p-6 space-y-4 bg-gray-800">
          <h2 className="text-xl font-semibold text-turbo-blue">
            QStash Cron Scheduler
          </h2>
          <div>
            <Label
              htmlFor="cronExpression"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Cron Expression
            </Label>
            <Input
              id="cronExpression"
              type="text"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              placeholder="e.g., 0 0 * * 0 (every Sunday midnight)"
              className="w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            />
          </div>
          <div>
            <Label
              htmlFor="qstashEventId"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Event ID
            </Label>
            <Input
              id="qstashEventId"
              type="text"
              value={qstashEventId}
              onChange={(e) => setQstashEventId(e.target.value)}
              placeholder="e.g., calendar-watch-renewal"
              className="w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            />
          </div>
          <div>
            <Label
              htmlFor="qstashWatchId"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Watch ID (number)
            </Label>
            <Input
              id="qstashWatchId"
              type="number"
              value={qstashWatchId}
              onChange={(e) => setQstashWatchId(e.target.value)}
              placeholder="e.g., 1"
              className="w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            />
          </div>
          <div>
            <Label
              htmlFor="qstashChannelId"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Channel ID
            </Label>
            <Input
              id="qstashChannelId"
              type="text"
              value={qstashChannelId}
              onChange={(e) => setQstashChannelId(e.target.value)}
              placeholder="e.g., test"
              className="w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            />
          </div>
          <div>
            <Label
              htmlFor="qstashResourceId"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Resource ID
            </Label>
            <Input
              id="qstashResourceId"
              type="text"
              value={qstashResourceId}
              onChange={(e) => setQstashResourceId(e.target.value)}
              placeholder="e.g., test"
              className="w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            />
          </div>
          <div>
            <Label
              htmlFor="qstashUserId"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              User ID (number)
            </Label>
            <Input
              id="qstashUserId"
              type="number"
              value={qstashUserId}
              onChange={(e) => setQstashUserId(e.target.value)}
              placeholder="e.g., 1"
              className="w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            />
          </div>
          <div>
            <Label
              htmlFor="qstashCallbackUrl"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Callback URL
            </Label>
            <Input
              id="qstashCallbackUrl"
              type="text"
              value={qstashCallbackUrl}
              onChange={(e) => setQstashCallbackUrl(e.target.value)}
              placeholder="e.g., /api/qstash-callback"
              className="w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            />
          </div>
          <Button
            onClick={handleScheduleQStashCron}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Schedule QStash Cron
          </Button>
        </div>

        {/* --- */}

        {/* Tasks Missing Looms Section (NEW) */}
        <div className="border border-gray-700 rounded-lg p-6 space-y-4 bg-gray-800 col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold text-turbo-blue">
            Tasks Missing Looms
          </h2>
          <div>
            <Label
              htmlFor="loomTasksProjectId"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Project ID
            </Label>
            <Input
              id="loomTasksProjectId"
              type="number"
              value={loomTasksProjectId}
              onChange={(e) => setLoomTasksProjectId(e.target.value)}
              placeholder="e.g., 1"
              className="w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            />
          </div>
          <Button
            onClick={handleGetTasksMissingLooms}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Get Tasks Missing Looms
          </Button>

          {tasksMissingLooms.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-300 mb-3">
                Results:
              </h3>
              <ul className="space-y-2">
                {tasksMissingLooms.map((task) => (
                  <li key={task.id} className="bg-gray-700 p-3 rounded-md">
                    <p className="text-base font-semibold text-white">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-gray-300">
                        {task.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Status: {task.status || "N/A"} | Priority:{" "}
                      {task.priority || "N/A"} | Due:{" "}
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                    {task.assignee && (
                      <p className="text-xs text-gray-400">
                        Assignee: {task.assignee.name || "N/A"} (Slack ID:{" "}
                        {task.assignee.slackUser?.slackUserId || "N/A"})
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {tasksMissingLooms.length === 0 &&
            loomTasksProjectId !== "1" && ( // Only show if a search was performed and no results
              <p className="text-gray-400 mt-4">
                No tasks missing Looms found for this project.
              </p>
            )}
        </div>
      </div>
    </div>
  );
}
