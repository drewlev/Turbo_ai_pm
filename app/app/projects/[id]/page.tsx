import { ProjectHeader } from "@/app/app/projects/[id]/components/project-header";
import { SnapshotSummary } from "@/app/app/projects/[id]/components/snapshot-summary";
import { TasksSection } from "@/app/app/projects/[id]/components/task-section";
import { DeliverablesFeed } from "@/app/app/projects/[id]/components/deliverables-feed";
import { MeetingsSummary } from "@/app/app/projects/[id]/components/meeting-summary";
import { SlackActivity } from "@/app/app/projects/[id]/components/slack-activity";
import { getTasksByProjectId } from "@/app/actions/tasks";
import Frame from "@/components/vercel-tabs";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Dashboard({ params, searchParams }: Props) {
  const [resolvedParams] = await Promise.all([params, searchParams]);
  const tasks = await getTasksByProjectId(Number(resolvedParams.id));
  return (
    <div className="flex min-h-screen bg-[var(--background-dark)]">
      {/* Main Content */}
      <div className="flex-1">
        {/* Sticky Header */}
        <ProjectHeader />

        {/* Main Content Area */}
        <main className="max-w-[1200px] mx-auto px-8">
          {/* <Frame /> */}
          {/* Tabs Navigation */}
          <Frame
            defaultValue="snapshot"
            tabs={[
              {
                label: "Snapshot",
                value: "snapshot",
                content: (
                  <>
                    <SnapshotSummary />
                    <TasksSection tasks={tasks} />
                    <DeliverablesFeed />
                    <MeetingsSummary />
                    <SlackActivity />
                  </>
                ),
              },
              {
                label: "Tasks",
                value: "tasks",
                content: (
                  <div className="w-full">
                    <TasksSection tasks={tasks} />
                  </div>
                ),
              },
              {
                label: "Meetings",
                value: "meetings",
                content: (
                  <div className="w-full">
                    <MeetingsSummary />
                  </div>
                ),
              },
              {
                label: "Files",
                value: "files",
                content: (
                  <>
                    <DeliverablesFeed />
                  </>
                ),
              },
            ]}
          />
        </main>
      </div>
    </div>
  );
}
