import { useState } from "react";
import { toast } from "sonner";
import { updateProjectStatus } from "@/app/actions/projects";


export function useProjectActivation(projectId: number) {
  const [isPending, setIsPending] = useState(false);

  const activateProject = async () => {
    setIsPending(true);
    try {
      const result = await updateProjectStatus(projectId, "active");
      if (result) {
        toast.success("Project activated successfully");
        return true;
      } else {
        toast.error("Failed to activate project");
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to activate project");
      return false;
    } finally {
      setIsPending(false);
    }
  };


  return {
    activateProject,
    isPending,
  };
}
