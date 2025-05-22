import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import type { ProjectInfo } from "@/app/types/project";
import type { Client } from "@/app/types/project";

type ProjectSetupProgressProps = {
  projectInfo: ProjectInfo;
  clients: Client[];
  onActivateProject: () => void;
  isPending: boolean;
};

const REQUIRED_STEPS = [
  {
    id: "projectName",
    label: "Project Name",
    isComplete: (info: ProjectInfo) => !!info.projectName?.trim(),
  },
  {
    id: "websiteUrl",
    label: "Website URL",
    isComplete: (info: ProjectInfo) => !!info.websiteUrl?.trim(),
  },
  {
    id: "description",
    label: "Project Description",
    isComplete: (info: ProjectInfo) => !!info.description?.trim(),
  },
  {
    id: "clients",
    label: "Key Clients",
    isComplete: (_: ProjectInfo, clients: Client[]) => clients.length > 0,
  },
];

export function ProjectSetupProgress({
  projectInfo,
  clients,
  onActivateProject,
  isPending,
}: ProjectSetupProgressProps) {
  const completedSteps = REQUIRED_STEPS.filter((step) =>
    step.isComplete(projectInfo, clients)
  ).length;
  const progress = (completedSteps / REQUIRED_STEPS.length) * 100;
  const isProjectReady = completedSteps === REQUIRED_STEPS.length;

  return (
    <Card className="bg-[var(--background-light)] border-[var(--border-dark)] p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">
            Project Setup Progress
          </h2>
          <Progress
            value={progress}
            className="h-2 [&>div]:bg-[var(--turbo-blue)] bg-[var(--turbo-blue)]/20"
          />
        </div>

        <div className="space-y-3">
          {REQUIRED_STEPS.map((step) => {
            const isComplete = step.isComplete(projectInfo, clients);
            return (
              <div key={step.id} className="flex items-center gap-3 text-sm">
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-[var(--text-secondary)]" />
                )}
                <span
                  className={
                    isComplete
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]"
                  }
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {isProjectReady && (
          <div className="pt-4 border-t border-[var(--border-dark)]">
            <Button
              onClick={onActivateProject}
              disabled={isPending}
              className="w-full bg-[var(--turbo-blue)] hover:bg-[var(--turbo-blue)]/90 text-[var(--text-primary)]"
            >
              {isPending ? "Activating..." : "Activate Project"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
