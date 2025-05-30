// components/status-button.tsx
"use client";

import { CheckCircle, Circle, LoaderCircle, CircleAlert } from "lucide-react";
import { Combobox } from "../combobox";
import { Button } from "../ui/button";
import { updateTask } from "@/app/actions/tasks";

type Option = {
  value: string;
  label: string;
  icon: React.ReactNode;
};

const statusOptions: Option[] = [
  { value: "todo", label: "To Do", icon: <Circle /> },
  {
    value: "in_progress",
    label: "In Progress",
    icon: <LoaderCircle className="animate-spin slow-spin" />,
  },
  {
    value: "needs_review",
    label: "Needs Review",
    icon: <CircleAlert className="text-yellow-500" />,
  },
  {
    value: "done",
    label: "Done",
    icon: <CheckCircle className="text-green-500" />,
  },
];

export const StatusButton = ({
  status,
  taskId,
  onStatusUpdated,
  onClick,
}: {
  status: string;
  taskId: number;
  onStatusUpdated: (taskId: number, newStatus: string) => void;
  onClick?: (e: React.MouseEvent) => void;
}) => {
  const handleStatusChange = async (newStatus: string) => {
    try {
      const updatedTask = await updateTask(taskId, {
        status: newStatus,
      });
      if (updatedTask) {
        onStatusUpdated(taskId, newStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      // Optionally, update local state to reflect an error
    }
  };

  return (
    <Combobox
      options={statusOptions}
      value={status}
      onValueChange={(value) => handleStatusChange(value as string)}
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
          onClick={onClick}
        >
          {status ? (
            <>
              {statusOptions.find((opt) => opt.value === status)?.icon}
              <span>
                {statusOptions.find((opt) => opt.value === status)?.label}
              </span>
            </>
          ) : (
            <>
              <span className="mr-1"></span> Status
            </>
          )}
        </Button>
      }
    />
  );
};
