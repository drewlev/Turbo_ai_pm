import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProjectInfo } from "@/app/actions/projects";
import type { ProjectInfo } from "@/app/types/project";

export function useProjectInfo(projectId: number, initialInfo: ProjectInfo) {
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(initialInfo);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await updateProjectInfo(projectId, {
          name: formData.get("projectName") as string,
          description: formData.get("description") as string,
          websiteUrl: formData.get("websiteUrl") as string,
        });

        if (result) {
          toast.success("Project information updated successfully");
        } else {
          toast.error("Failed to update project information");
        }
      } catch (error) {
        toast.error("Failed to update project information");
      }
    });
  };

  return {
    projectInfo,
    setProjectInfo,
    handleSubmit,
    isPending,
  };
}
