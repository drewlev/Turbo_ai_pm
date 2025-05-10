import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectHeader } from "@/app/app/projects/[id]/components/project-header";
import { SnapshotSummary } from "@/app/app/projects/[id]/components/snapshot-summary";
import { TasksSection } from "@/app/app/projects/[id]/components/task-section";
import { DeliverablesFeed } from "@/app/app/projects/[id]/components/deliverables-feed";
import { MeetingsSummary } from "@/app/app/projects/[id]/components/meeting-summary";
import { SlackActivity } from "@/app/app/projects/[id]/components/slack-activity";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-[var(--background-dark)]">
      {/* Main Content */}
      <div className="flex-1">
        {/* Sticky Header */}
        <ProjectHeader />

        {/* Main Content Area */}
        <main className="max-w-[1200px] mx-auto px-8">
          {/* Tabs Navigation */}
          <Tabs defaultValue="snapshot" className="w-full">
            <TabsList className="border-none border-[var(--border-dark)] w-full justify-start rounded-none bg-transparent h-auto py-0">
              <TabsTrigger
                value="snapshot"
                className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-[var(--text-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none px-4 py-4 text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] transition-colors"
              >
                Snapshot
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-[var(--text-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none px-4 py-4 text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] transition-colors"
              >
                Tasks
              </TabsTrigger>
              <TabsTrigger
                value="meetings"
                className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-[var(--text-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none px-4 py-4 text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] transition-colors"
              >
                Meetings
              </TabsTrigger>
              <TabsTrigger
                value="files"
                className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-[var(--text-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none px-4 py-4 text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] transition-colors"
              >
                Files
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-[var(--text-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none px-4 py-4 text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] transition-colors"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="snapshot" className="mt-8 space-y-8">
              <SnapshotSummary />
              <TasksSection />
              <DeliverablesFeed />
              <MeetingsSummary />
              <SlackActivity />
            </TabsContent>

            <TabsContent value="tasks">
              <div className="py-8">
                <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                  All Tasks
                </h2>
                <p className="text-[var(--text-secondary)]">
                  Full task management view would go here.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="meetings">
              <div className="py-8">
                <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                  All Meetings
                </h2>
                <p className="text-[var(--text-secondary)]">
                  Full meetings history and calendar would go here.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="files">
              <div className="py-8">
                <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                  Files & Documents
                </h2>
                <p className="text-[var(--text-secondary)]">
                  File repository would go here.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="py-8">
                <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                  Project Settings
                </h2>
                <p className="text-[var(--text-secondary)]">
                  Project configuration options would go here.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
