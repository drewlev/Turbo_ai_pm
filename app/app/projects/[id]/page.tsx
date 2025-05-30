import { ProjectHeader } from "@/app/app/projects/[id]/components/project-header";
// import { SnapshotSummary } from "@/app/app/projects/[id]/components/snapshot-summary";
import { TasksSection } from "@/app/app/projects/[id]/components/task-section";
import { DeliverablesFeed } from "@/components/deliverables-feed";
import {
  getTasksByProjectId,
  TaskWithAssigneesType,
} from "@/app/actions/tasks";
import Frame from "@/components/vercel-tabs";
import { SettingsSection } from "@/app/app/projects/[id]/components/settings/setting";
import { getProjectDetails } from "@/app/actions/projects";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Dashboard({ params, searchParams }: Props) {
  const [resolvedParams] = await Promise.all([params, searchParams]);
  const tasks = await getTasksByProjectId(Number(resolvedParams.id));
  const projectDetails = await getProjectDetails(Number(resolvedParams.id));
  const TaskByMeeting = () => {
    // Group tasks by meeting
    const tasksByMeeting = tasks.reduce((acc, task) => {
      const meetingId = task.meetingId;
      if (!meetingId) return acc;

      if (!acc[meetingId]) {
        acc[meetingId] = {
          meeting: task.meeting,
          tasks: [],
        };
      }
      acc[meetingId].tasks.push(task);
      return acc;
    }, {} as Record<number, { meeting: any; tasks: TaskWithAssigneesType[] }>);

    return (
      <>
        {Object.entries(tasksByMeeting).map(
          ([meetingId, { meeting, tasks: meetingTasks }]) => (
            <TasksSection
              key={meetingId}
              tasks={meetingTasks}
              title={meeting?.title || "Untitled Meeting"}
            />
          )
        )}
      </>
    );
  };

  // console.log({looms});
  if (!projectDetails) {
    return <div>Project not found</div>;
  }

  const { project } = projectDetails;

  if (project.status === "pending") {
    return (
      <div className="flex min-h-screen bg-[var(--background-dark)]">
        {/* Main Content */}
        <div className="flex-1">
          {/* Sticky Header */}
          <ProjectHeader projectDetails={projectDetails} />

          {/* Main Content Area */}
          <main className="max-w-[1200px] mx-auto px-8">
            <Frame
              defaultValue="settings"
              tabs={[
                {
                  label: "Settings",
                  value: "settings",
                  content: (
                    <div className="w-full">
                      <SettingsSection projectDetails={projectDetails} />
                    </div>
                  ),
                },
              ]}
            />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--background-dark)]">
      {/* Main Content */}
      <div className="flex-1">
        {/* Sticky Header */}
        <ProjectHeader projectDetails={projectDetails} />

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
                    {/* <SnapshotSummary /> */}
                    <TasksSection tasks={tasks} />
                    <DeliverablesFeed tasks={tasks} />
                    {/* <MeetingsSummary />
                    <SlackActivity /> */}
                  </>
                ),
              },
              {
                label: "Tasks",
                value: "tasks",
                content: (
                  <div className="w-full">
                    <TaskByMeeting />
                  </div>
                ),
              },
              {
                label: "Settings",
                value: "settings",
                content: (
                  <div className="w-full">
                    <SettingsSection projectDetails={projectDetails} />
                  </div>
                ),
              },
              // {
              //   label: "Meetings",
              //   value: "meetings",
              //   content: (
              //     <div className="w-full">
              //       <MeetingsSummary />
              //     </div>
              //   ),
              // },
              // {
              //   label: "Files",
              //   value: "files",
              //   content: (
              //     <>
              //       <DeliverablesFeed />
              //     </>
              //   ),
              // },
            ]}
          />
        </main>
      </div>
    </div>
  );
}
