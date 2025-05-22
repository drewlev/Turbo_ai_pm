import { ProjectHeader } from "@/app/app/projects/[id]/components/project-header";
import { SnapshotSummary } from "@/app/app/projects/[id]/components/snapshot-summary";
import { TasksSection } from "@/app/app/projects/[id]/components/task-section";
import { DeliverablesFeed } from "@/app/app/projects/[id]/components/deliverables-feed";
import { getTasksByProjectId } from "@/app/actions/tasks";
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

  if (!projectDetails) {
    return <div>Project not found</div>;
  }

  const { project, clients } = projectDetails;

  if (project.status === "pending") {
    return (
      <div className="flex min-h-screen bg-[var(--background-dark)]">
        {/* Main Content */}
        <div className="flex-1">
          {/* Sticky Header */}
          <ProjectHeader />

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
                      <SettingsSection
                        projectId={project.id}
                        initialProjectInfo={{
                          projectName: project.name,
                          description: project.description || "",
                          websiteUrl: project.websiteUrl || "",
                        }}
                        initialClients={clients}
                        initialQaItems={projectDetails.qaItems}
                      />
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
                    <TasksSection tasks={tasks} />
                  </div>
                ),
              },
              {
                label: "Settings",
                value: "settings",
                content: (
                  <div className="w-full">
                    <SettingsSection
                      projectId={project.id}
                      initialProjectInfo={{
                        projectName: project.name,
                        description: project.description || "",
                        websiteUrl: project.websiteUrl || "",
                      }}
                      initialClients={clients}
                      initialQaItems={projectDetails.qaItems}
                    />
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
