"use client";
import type React from "react";
import {
  AssigneeButton,
  type Assignee,
} from "@/components/assign-users-button";
import { useEffect, useState } from "react";
import {
  getProjectUsers,
  updateProjectUsers,
  getAvailableUsers,
} from "@/app/actions/projects";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ProjectDetails } from "@/app/types/project";

interface User {
  id: number;
  name: string | null;
}

export function ProjectHeader({
  projectDetails,
}: {
  projectDetails: ProjectDetails;
}) {
  const params = useParams();
  const projectId = parseInt(params.id as string);

  const [projectAssignees, setProjectAssignees] = useState<Assignee[]>([]);
  const [availableUsers, setAvailableUsers] = useState<
    { value: string; label: string }[]
  >([]);
  // const [isLoading, setIsLoading] = useState(true);

  // Fetch project users and available users
  useEffect(() => {
    const fetchData = async () => {
      try {
        // setIsLoading(true);
        const users = await getProjectUsers(projectId);

        // Transform users into the format needed for AssigneeButton
        const assignees: Assignee[] = users.map((user) => ({
          id: user.userId,
          url: user.userId.toString(),
        }));

        setProjectAssignees(assignees);

        const availableUsersData = await getAvailableUsers();
        setAvailableUsers(
          availableUsersData.map((user: User) => ({
            value: user.id.toString(),
            label: user.name || "",
          }))
        );
      } catch (error) {
        console.error("Error fetching project users:", error);
        toast.error("Failed to load project users");
      } finally {
        // setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleAssigneeChange = async (selectedIds: string[]) => {
    try {
      // Get the IDs that were added and removed
      const currentIds = projectAssignees.map((a) => a.id.toString());
      const addedIds = selectedIds.filter((id) => !currentIds.includes(id));
      const removedIds = currentIds.filter((id) => !selectedIds.includes(id));

      // Handle additions and removals
      if (addedIds.length > 0) {
        await updateProjectUsers(
          addedIds.map((id) => parseInt(id)),
          projectId,
          "add"
        );
      }

      if (removedIds.length > 0) {
        await updateProjectUsers(
          removedIds.map((id) => parseInt(id)),
          projectId,
          "remove"
        );
      }

      // Update local state
      const newAssignees = selectedIds.map((id) => ({
        id: parseInt(id),
        url: id,
      }));
      setProjectAssignees(newAssignees);

      toast.success("Project members updated successfully");
    } catch (error) {
      console.error("Error updating project users:", error);
      toast.error("Failed to update project members");
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-[var(--background-dark)] border-b border-[var(--border-dark)] shadow-sm">
      <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* <Image
            className="rounded-sm"
            src="https://n1v74cls2c.ufs.sh/f/XAC5NGVjIxRTyIYbktgRkYIPZNFQpvTomWh6SO39DjtMaGlu"
            alt="Rally"
            width={32}
            height={32}
          /> */}
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            {projectDetails.project.name}
          </h1>
          <div className="flex items-center gap-2 text-[var(--text-secondary)]"></div>
        </div>

        <div className="flex items-center gap-6">
          {/* <Badge
            variant="outline"
            className="bg-blue-500 text-[var(--text-primary)] border-[var(--border-accent)] px-3 py-1"
          >
            Design Phase
          </Badge> */}

          <div className="flex -space-x-2">
            <AssigneeButton
              assigneeValue={projectAssignees}
              assigneeOptions={availableUsers}
              onValueChange={handleAssigneeChange}
              placeholder="Project Members"
              className="h-8 text-xs bg-transparent border-[var(--border-dark)] text-[var(--text-primary)] hover:bg-[var(--background-light)] hover:text-white"
            />
          </div>

          {/* <div className="text-sm text-[var(--text-secondary)]">
            <span>May 1 – Jun 30, 2025</span>
          </div> */}
        </div>
      </div>
    </header>
  );
}

// function WarningIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
//       <path d="M12 9v4" />
//       <path d="M12 17h.01" />
//     </svg>
//   );
// }
